import { Component } from '@angular/core';

import { FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import * as THREE from 'three';
import { ColorEvent } from 'ngx-color';
import { Editor } from '../../../assets/js/Editor';

import { FRONT_ROUTES } from 'src/app/constants';

import {
  DeleteObjectRes,
  GetWorkspaceRes,
  PinObjectRes,
  ReportChangesRes,
  UnpinObjectRes
} from 'src/app/interfaces';

import { WorkspaceStateService, WorkspaceSyncService } from 'src/app/services';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss']
})
export class EditorComponent {
  private readonly editor: Editor;

  public readonly objForm: FormGroup = new FormGroup({ // Generic attributes of an object
    name: new FormControl('', Validators.required),
    posX: new FormControl('', Validators.required),
    posY: new FormControl('', Validators.required),
    posZ: new FormControl('', Validators.required),
    scaX: new FormControl('', Validators.required),
    scaY: new FormControl('', Validators.required),
    scaZ: new FormControl('', Validators.required),
    rotX: new FormControl('', Validators.required),
    rotY: new FormControl('', Validators.required),
    rotZ: new FormControl('', Validators.required),
  });

  private readonly link: HTMLAnchorElement = document.createElement('a');

  private updateTimer: number = -1;

  private workspaceId: string;
  private userId: string;
  private oldObj: THREE.Mesh;

  public constructor(
    private readonly router: Router,
    private readonly workspaceStateService: WorkspaceStateService,
    private readonly workspaceSyncService: WorkspaceSyncService
  ) {
    this.editor = new Editor();
    this.editor.setObjectChangeCallback(this.updateEditControls.bind(this));

    this.workspaceId = workspaceStateService.getWorkspaceId();
    this.userId = workspaceStateService.getUserId();

    this.setUpClickEvent();
    this.setUpKeydownEvent();

    this.updateWorkspace(false);

    // Every 2.5 seconds, refresh the workspace with whatever is on the server.
    window.setInterval((): void => {
      // Keep the selected object since we may not have sent our most recent
      // changes.
      this.updateWorkspace(true);
    }, 2500);
  }

  /**
   * Remove all items from the workspace and replace them with anything from
   * the server.
   *
   * @param keepSelected True iff we don't want to replace the selected object.
   */
  private updateWorkspace(keepSelected: boolean): void {
    this.workspaceSyncService.getWorkspace(this.workspaceId).subscribe(
        (res: GetWorkspaceRes): void => {
      if (res.data.getWorkspace) {
        this.editor.loadScene(res.data.getWorkspace, keepSelected);

        // Save the version of every object.
        for (const obj of res.data.getWorkspace) {
          this.workspaceStateService.saveVersionHistory(
              obj.objectId, obj.version);
        }
      } else {
        // If the workspace does not exist, navigate to the workspace control
        // screen.
        this.editor.renderer.domElement.remove();
        this.router.navigate([FRONT_ROUTES.WORKSPACE_CONTROL]);
      }
    });
  }

  // Form specific functions

  public updateObjectMaterial(event:ColorEvent): void {
    let obj = this.getCurrentObject();
    this.editor.updateObjectMaterial(obj, event.color.hex);

    this.prepareChanges(obj);
  }

  public updateObjectName(): void {
    let name = this.objForm.get('name').value;
    let obj = this.getCurrentObject();
    if (obj && name) {
      obj.name = name;
    }

    this.prepareChanges(obj);
  }

  public updateObjectPosition(): void {
    let x = this.objForm.get('posX').value;
    let y = this.objForm.get('posY').value;
    let z = this.objForm.get('posZ').value;
    this.editor.updateObjectPosition(this.getCurrentObject(), x, y, z);

    this.prepareChanges(this.getCurrentObject());
  }

  public updateObjectScale(): void {
    let x = this.objForm.get('scaX').value;
    let y = this.objForm.get('scaY').value;
    let z = this.objForm.get('scaZ').value;
    this.editor.updateObjectScale(this.getCurrentObject(), x, y, z);

    this.prepareChanges(this.getCurrentObject());
  }

  public updateObjectRotation(): void {
    let x = this.objForm.get('rotX').value;
    let y = this.objForm.get('rotY').value;
    let z = this.objForm.get('rotZ').value;
    this.editor.updateObjectRotation(this.getCurrentObject(), x, y, z);

    this.prepareChanges(this.getCurrentObject());
  }

  public updateEditControls(): void {
    let obj = this.getCurrentObject();
    if (obj) {
      this.objForm.get('name').setValue(obj.name);
      this.objForm.get('posX').setValue(obj.position.x);
      this.objForm.get('posY').setValue(obj.position.y);
      this.objForm.get('posZ').setValue(obj.position.z);
      this.objForm.get('scaX').setValue(obj.scale.x);
      this.objForm.get('scaY').setValue(obj.scale.y);
      this.objForm.get('scaZ').setValue(obj.scale.z);
      this.objForm.get('rotX').setValue(obj.rotation.x);
      this.objForm.get('rotY').setValue(obj.rotation.y);
      this.objForm.get('rotZ').setValue(obj.rotation.z);
    }

    this.prepareChanges(obj);
  }

  // Editor specific functions

  public changeTool(tool:string): void {
    this.editor.changeTool(tool);
  }

  public addNewObject(type:string): void {
    this.prepareChanges(this.editor.addNewObject(type));
  }

  public deleteCurrentObject(): void {
    const obj = this.getCurrentObject();
    // Since we are deleting the object, we don't need to tell the server
    // about recent changes.
    this.resetChangesTimer();

    if (obj) {
      this.workspaceSyncService.deleteObject(
        obj.uuid, this.userId, this.workspaceId
      ).subscribe((res: DeleteObjectRes): void => {
        if (res.data.deleteObject) {
          this.editor.deleteObject(obj);
        }
      });
    }
  }

  public selectObject(obj:THREE.Mesh | THREE.Object3D) {
    this.workspaceSyncService.pinObject(
      this.workspaceId, obj.uuid, this.userId
    ).subscribe((res: PinObjectRes): void => {
      if (res.data.pinObject) {
        this.editor.selectObject(obj);
        this.updateEditControls();
      }
    });
  }

  public getCurrentObject(): THREE.Mesh {
    return this.editor.getCurrentSelection();
  }

  public getObjectList(): THREE.Mesh[] {
    return this.editor.getObjectList();
  }

  private setUpClickEvent(): void {
    // when selecting an object by clicking on it
    document.addEventListener('click', (e :MouseEvent): void => {
      e.preventDefault();
      const raycaster = new THREE.Raycaster();
      const mouse = new THREE.Vector2();
      mouse.x = 2 * (
          e.clientX / this.editor.renderer.domElement.clientWidth
          ) - 1;
      mouse.y = -2 * (
          e.clientY / this.editor.renderer.domElement.clientHeight
          ) + 1;
      raycaster.setFromCamera(mouse, this.editor.camera);

      const intersects = raycaster.intersectObjects(
          this.editor.scene.children);
      if (intersects.length > 0) {
        this.selectObject(intersects[0].object);
      }
    });
  }

  private setUpKeydownEvent(): void {
    window.addEventListener('keydown', (event: KeyboardEvent): void => {
      if (event.shiftKey) {
        switch (event.keyCode) {
          case 68:
            // D
            this.deselectObject();
            break;
          case 8:
            // Backspace
            this.deleteCurrentObject();
            break;
          default:
            break;
        }
      }
    });
  }

  /**
   * Deselect the current object.
   *
   * First, update the server with the current information about the object.
   * Second, unpin the object on the server.
   */
  private deselectObject(): void {
    this.reportChanges(this.getCurrentObject(), (): void => {
      this.workspaceSyncService.unpinObject(
        this.workspaceId, this.getCurrentObject().uuid, this.userId
      ).subscribe((res: UnpinObjectRes): void => {
        if (res.data.unpinObject) {
          this.editor.deselectObject();
        }
      });
    });
  }

  private resetChangesTimer(): void {
    window.clearTimeout(this.updateTimer);
    this.updateTimer = -1;
    this.oldObj = null;
  }

  /**
   * Ready an object to be sent to the server.
   *
   * This method stores a reference to the object and will send it with its
   * latest changes to the server after one second since the object was first
   * given to this method.
   *
   * This delay prevents several requests being sent back-to-back.
   *
   * If the object given is different than the one stored, then the stored one
   * will be immediately sent to the server.
   *
   * @param obj
   */
  private prepareChanges(obj: THREE.Mesh): void {
    // Report changes if the user changes objects.
    if (this.oldObj !== obj && this.oldObj != null) {
      this.resetChangesTimer();
      this.reportChanges(this.oldObj);
    }

    // Every second, update the server of changes to the object.
    if (this.updateTimer < 0) {
      this.oldObj = obj;
      this.updateTimer = window.setTimeout((): void => {
        this.updateTimer = -1;
        this.reportChanges(obj);
      }, 1000);
    }
  }

  /**
   * Send the object to the server.
   *
   * The server will update its version of the scene using what was given.
   *
   * @param obj
   * @param callback To be called once the response from the server has been
   *     recieved.
   */
  private reportChanges(
    obj: THREE.Mesh,
    callback?: (success: boolean) => void
  ): void {
    if (!!obj) {
      // If the object given is the old object, then reset the timer.
      if (obj === this.oldObj) {
        this.resetChangesTimer();
      }

      // Increment the version of the object.
      const version = this.workspaceStateService.getVersionHistory(
          obj.uuid) + 1;

      this.workspaceSyncService.reportChanges(
        obj,
        this.userId,
        this.workspaceId,
        version
      ).subscribe((res: ReportChangesRes): void => {
        // Save the version locally.
        if (res.data.reportChanges) {
          this.workspaceStateService.saveVersionHistory(obj.uuid, version);
        }

        // Call the callback, if it exists.
        if (!!callback) {
          callback(res.data.reportChanges);
        }
      });
    }
  }

  public onFileInput(files):void {
    let file = files.item(0);
    if (file.type=='application/json') {
      file.text().then(function(text){
        let parsed = [];
        try{
          parsed = JSON.parse(text);
        } catch(err) {
          console.log('Error in parsing JSON file. JSON badly formatted.');
        } finally {
          for (const objData of parsed) {
            // check that given json has all the required properties
            if (objData.uuid instanceof String &&
                objData.name instanceof String &&
                objData.position instanceof Array &&
                objData.scale instanceof Array &&
                objData.rotation instanceof Array &&
                objData.geometryType instanceof String &&
                objData.materialColorHex instanceof String &&
                !objData.position.some(isNaN) &&
                !objData.scale.some(isNaN) &&
                !objData.rotation.some(isNaN)) {
              this.reportChanges(this.editor.addCustomObject(objData));
            }
          }
        }
      }.bind(this));
    }
  } 

  public importScene() {
    document.getElementById('file-upload').dispatchEvent(new MouseEvent('click'));
  }
  
  public exportScene(filetype:string, action:string):void {
    let link = this.link;
    let data = this.editor.exportScene(filetype);
    if (data) {
      let filename = 'architect3d_export.' + filetype;
      switch(action) {
        case 'download':
          saveString(data, filename);
          break;
        case 'googledrive':
          break;
      }
    }

    function save(blob, filename) {
      link.href = URL.createObjectURL(blob);
      link.download = filename || 'data.json';
      link.dispatchEvent(new MouseEvent('click'));
    }

    function saveString(text, filename) {
      save(new Blob([text], {type:'text/plain'}), filename);
    }
  }

}
