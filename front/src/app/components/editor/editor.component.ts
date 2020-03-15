import {
  AfterViewInit,
  Component,
} from '@angular/core';

import { FormControl, FormGroup, Validators } from '@angular/forms';
import * as THREE from 'three';
import { ColorEvent } from 'ngx-color';
import { Editor } from '../../../assets/js/Editor';

import {
  GetWorkspaceRes,
  PinObjectRes,
  ReportChangesRes
} from 'src/app/interfaces';

import { WorkspaceStateService, WorkspaceSyncService } from 'src/app/services';

@Component({
  selector: 'app-editor',
  templateUrl: './editor.component.html',
  styleUrls: ['./editor.component.scss']
})
export class EditorComponent implements AfterViewInit {
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

  private workspaceId: string;
  private userId: string;
  private oldObj: THREE.Object3D;

  public constructor(
    private readonly workspaceStateService: WorkspaceStateService,
    private readonly workspaceSyncService: WorkspaceSyncService
  ) {
    this.editor = new Editor();
    this.editor.setObjectChangeCallback(this.updateEditControls.bind(this));

    this.workspaceId = workspaceStateService.getWorkspaceId();
    this.userId = workspaceStateService.getUserId();

    this.setUpClickObjectEvent();

    this.workspaceSyncService.getWorkspace(this.workspaceId).subscribe(
        (res: GetWorkspaceRes) => {
      this.editor.loadScene(res.data.getWorkspace);

      for (const obj of res.data.getWorkspace) {
        this.workspaceStateService.saveVersionHistory(
            obj.objectId, obj.version);
      }
    });
  }

  public ngAfterViewInit(): void {
  }

  // Form specific functions

  public updateObjectMaterial(event:ColorEvent):void {
    let obj = this.getCurrentObject();
    this.editor.updateObjectMaterial(obj, event.color.hex);
  }

  public updateObjectName():void {
    let name = this.objForm.get('name').value;
    let obj = this.getCurrentObject();
    if (obj && name) {
      obj.name = name;
    }
  }

  public updateObjectPosition():void {
    let x = this.objForm.get('posX').value;
    let y = this.objForm.get('posY').value;
    let z = this.objForm.get('posZ').value;
    this.editor.updateObjectPosition(this.getCurrentObject(), x, y, z);
  }

  public updateObjectScale():void {
    let x = this.objForm.get('scaX').value;
    let y = this.objForm.get('scaY').value;
    let z = this.objForm.get('scaZ').value;
    this.editor.updateObjectScale(this.getCurrentObject(), x, y, z);
  }

  public updateObjectRotation():void {
    let x = this.objForm.get('rotX').value;
    let y = this.objForm.get('rotY').value;
    let z = this.objForm.get('rotZ').value;
    this.editor.updateObjectRotation(this.getCurrentObject(), x, y, z);
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

    // Every second, update the server of changes.
    if (this.updateTimer < 0) {
      this.oldObj = obj;
      this.updateTimer = window.setTimeout(() => {
        this.updateTimer = -1;
        this.reportChanges(obj);
      }, 1000);
    }

    // Report changes if the user changes objects.
    if (this.oldObj !== obj) {
      window.clearTimeout(this.updateTimer);
      this.updateTimer = -1;
      this.reportChanges(obj);
    }
  }

  // Editor specific functions

  public changeTool(tool:string) {
    this.editor.changeTool(tool);
  }

  public addNewObject(type:string) {
    this.editor.addNewObject(type);
  }

  public deleteCurrentObject(){
    if (this.getCurrentObject()) {
      this.editor.deleteObject(this.getCurrentObject());
    }
  }

  public selectObject(obj:THREE.Mesh | THREE.Object3D) {
    this.workspaceSyncService.pinObject(
      this.workspaceId, obj.uuid, this.userId
    ).subscribe((res: PinObjectRes) => {
      if (res.data.pinObject) {
        this.editor.selectObject(obj);
        this.updateEditControls();
      }
    });
  }

  public getCurrentObject() {
    return this.editor.getCurrentSelection();
  }

  public getObjectList() {
    return this.editor.getObjectList();
  }

  private setUpClickObjectEvent() {
    // when selecting an object by clicking on it
    document.addEventListener('click', (e) => {
      e.preventDefault();
      // Only select if nothing is currently selected
      // if (!currentSelection) {
      var raycaster = new THREE.Raycaster();
      var mouse = new THREE.Vector2();
      mouse.x = ( e.clientX / this.editor.renderer.domElement.clientWidth ) * 2 - 1;
      mouse.y = - ( e.clientY / this.editor.renderer.domElement.clientHeight ) * 2 + 1;
      raycaster.setFromCamera( mouse, this.editor.camera );

      var intersects = raycaster.intersectObjects( this.editor.scene.children );
      if ( intersects.length > 0) {
        this.selectObject(intersects[0].object);
      }
      // }
    });
  }

  private reportChanges(obj: THREE.Mesh): void {
    if (!!obj) {
      this.workspaceSyncService.reportChanges(
        obj,
        this.userId,
        this.workspaceId,
        this.workspaceStateService.getVersionHistory(obj.uuid) + 1
      ).subscribe((res: ReportChangesRes) => {});
    }
  }

}
