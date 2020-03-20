import { Component } from '@angular/core';

import { FormControl, FormGroup, Validators } from '@angular/forms';
import * as THREE from 'three';
import { ColorEvent } from 'ngx-color';
import { Editor } from '../../../assets/js/Editor';

import {
  ObjectInfo
} from 'src/app/interfaces';

import {
  RtcService,
  WorkspaceStateService
} from 'src/app/services';

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

  private updateTimer: number = -1;

  private oldObj: THREE.Mesh;

  public constructor(
    private readonly rtc: RtcService,
    private readonly state: WorkspaceStateService
  ) {
    this.editor = new Editor();
    this.editor.setObjectChangeCallback(this.updateEditControls.bind(this));

    this.setUpClickEvent();
    this.setUpKeydownEvent();

    this.rtc.createObject().subscribe((objInfo: ObjectInfo): void => {
      this.editor.loadObj(objInfo, false);
    });

    this.rtc.modifyObject().subscribe((objInfo: ObjectInfo): void => {
      this.editor.deleteObjectByUuid(objInfo.objectId);
      this.editor.loadObj(objInfo, true);
    });

    this.rtc.pinObject().subscribe((objId: string): void => {
      this.state.addOtherUsersPin(objId);
    });

    this.rtc.unpinObject().subscribe((objId: string): void => {
      this.state.removeOtherUsersPin(objId);
    });

    this.rtc.deleteObject().subscribe((objId: string): void => {
      this.editor.deleteObjectByUuid(objId);
    });

    this.rtc.copyWorkspaceReq().subscribe((peer: string): void => {
      this.rtc.sendCopyWorkspaceRes(
          this.editor.scene.children.filter(
            (obj: THREE.Object3D): boolean => {
              return obj instanceof THREE.Mesh;
            }),
          peer);
    });

    this.rtc.copyWorkspaceRes().subscribe((objs: ObjectInfo[]): void => {
      this.editor.loadScene(objs);
    });

    if (this.state.getJoinedWorkspace()) {
      this.rtc.sendCopyWorkspaceReq();
    }
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
    const obj: THREE.Mesh = this.editor.addNewObject(type);

    this.selectObject(obj);
    this.rtc.sendCreateObjectMessage(obj);
  }

  public deleteCurrentObject(): void {
    const obj = this.getCurrentObject();
    // Since we are deleting the object, we don't need to tell the server
    // about recent changes.
    this.resetChangesTimer();

    if (obj) {
      this.rtc.sendDeleteObjectMessage(obj.uuid);

      this.editor.deleteObject(obj);
    }
  }

  public selectObject(obj: THREE.Mesh | THREE.Object3D) {
    if (obj) {
      if (!this.state.isPinnedByOther(obj.uuid)) {
        this.deselectCurrentObject();
        this.rtc.sendPinObjectMessage(obj.uuid);

        this.state.setCurrentUsersPin(obj.uuid);

        this.editor.selectObject(obj);
        this.updateEditControls();
      }
    }
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
            this.deselectCurrentObject();
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
  private deselectCurrentObject(): void {
    const obj = this.getCurrentObject();

    if (obj) {
      this.rtc.sendModifyObjectMessage(this.getCurrentObject());
      this.rtc.sendUnpinObjectMessage(this.getCurrentObject().uuid);

      this.editor.deselectCurrentObject();
    };
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
      }, 100);
    }
  }

  /**
   * Send the object to the server.
   *
   * The server will update its version of the scene using what was given.
   *
   * @param obj
   */
  private reportChanges(
    obj: THREE.Mesh
  ): void {
    if (obj) {
      this.rtc.sendModifyObjectMessage(obj);
    }
  }

}
