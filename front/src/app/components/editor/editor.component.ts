import { Component } from '@angular/core';

import { FormControl, FormGroup, Validators } from '@angular/forms';
import * as THREE from 'three';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ColorEvent } from 'ngx-color';
import { Editor } from '../../../assets/js/Editor';

import {
  ObjectInfo
} from 'src/app/interfaces';

import {
  RtcService,
  WorkspaceStateService
} from 'src/app/services';

declare const gapi: any;

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

  private oldObj: THREE.Mesh;

  private CLIENT_ID = '316564469406-tbr553n24lmf2rkap6ir7rcmv0fi6oro.apps.googleusercontent.com';
  private API_KEY = 'AIzaSyDeapSoJmwymR3N0X0GgZKgrKnoLpxHVqo';
  private SCOPES = 'https://www.googleapis.com/auth/drive';
  private DISCOVERY_DOCS = ["https://www.googleapis.com/discovery/v1/apis/drive/v3/rest"];
  public auth2: any;

  public constructor(
    public snackBar: MatSnackBar,
    private readonly rtc: RtcService,
    private readonly state: WorkspaceStateService
  ) {
    this.editor = new Editor();
    this.editor.setObjectChangeCallback(this.updateEditControls.bind(this));

    this.handleClientLoad();

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

  public onFileInput(files):void {
    console.log('file input');
    let file = files.item(0);
    console.log(file);
    if (file.type=='application/json') {
      file.text().then(function(text){
        console.log(text);
        let parsed = [];
        try{
          parsed = JSON.parse(text);
        } catch(err) {
          console.log('Error in parsing JSON file. JSON badly formatted.');
        } finally {
          for (const objData of parsed) {
            // check that given json has all the required properties
            if (typeof objData.name == "string"  &&
                typeof objData.geometryType == "string" &&
                typeof objData.materialColorHex == "string" &&
                !objData.position.some(isNaN) &&
                !objData.scale.some(isNaN) &&
                !objData.rotation.slice(0,3).some(isNaN)) {
              console.log(objData);
              const newObj = this.editor.addObjToScene(objData, true);
              console.log(newObj);
              this.rtc.sendCreateObjectMessage(newObj);
            }
          }
        }
      }.bind(this));
    }
  } 

  public importScene() {
    document.getElementById('file-upload').dispatchEvent(new MouseEvent('click'));
  }
  
  public downloadScene(filetype:string):void {
    let link = this.link;
    let data = this.editor.exportScene(filetype);
    if (data) {
      let filename = 'architect3d_export.' + filetype;
      saveString(data, filename);
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

  public uploadSceneToDrive(filetype:string) {
    // check that user is signed into google
    if (gapi.auth2.getAuthInstance().isSignedIn.get()) {
      // https://developers.google.com/drive/api/v3/manage-uploads#multipart
      let data = this.editor.exportScene(filetype)
      if (data) {
        let file = new Blob([data], {type:'plain/text'});
        let metadata = {
          'name':'architect3d_export.'+filetype,
          'mimeType':'text/plain',
        }
        let accessToken = gapi.auth.getToken().access_token;
        let form = new FormData();
        form.append('metadata', new Blob([JSON.stringify(metadata)], {type:'application/json'}));
        form.append('file', file);

        let xhr = new XMLHttpRequest();
        xhr.open('post', 'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart');
        xhr.setRequestHeader('Authorization', 'Bearer ' + accessToken);
        xhr.responseType = 'json';
        xhr.onload = () => {
          if (xhr.status === 200) {
            console.log('Successfully uploaded file to google drive!');
            this.showNotification('Uploaded file to Google Drive!', 'Dismiss');
          }
        };
        xhr.send(form);
      } else {
        console.log('invalid file type for export');
      }
    }
  }

  public toggleHelpVisibility() {
    const helpEl = document.getElementById('help-container');
    helpEl.style.display = helpEl.style.display == 'none' ? 'block' : 'none';
  }

  // Google Authentication Methods
  // Ref: https://developers.google.com/drive/api/v3/quickstart/js
  // https://developers.google.com/identity/sign-in/web/reference
  /**
   *  On load, called to load the auth2 library and API client library.
   */
  public handleClientLoad() {
    gapi.load('client:auth2', this.initClient.bind(this));
  }

  /**
   *  Initializes the API client library and sets up sign-in state
   *  listeners.
   */
  public initClient() {
    let authorizeButton = document.getElementById('googleSignInBtn');
    let signoutButton = document.getElementById('googleSignOutBtn');
    gapi.client.init({
      apiKey: this.API_KEY,
      clientId: this.CLIENT_ID,
      discoveryDocs: this.DISCOVERY_DOCS,
      scope: this.SCOPES
    }).then(function () {
      // Listen for sign-in state changes.
      gapi.auth2.getAuthInstance().isSignedIn.listen(this.updateSigninStatus);

      // Handle the initial sign-in state.
      this.updateSigninStatus.bind(this)(gapi.auth2.getAuthInstance().isSignedIn.get());
      authorizeButton.onclick = this.handleAuthClick;
      signoutButton.onclick = this.handleSignoutClick;
    }.bind(this), function(error) {
      console.log(JSON.stringify(error, null, 2));
    });
  }

  /**
   *  Called when the signed in status changes, to update the UI
   *  appropriately. After a sign-in, the API is called.
   */
  public updateSigninStatus(isSignedIn) {
    let authorizeButton = document.getElementById('googleSignInBtn');
    let signoutButton = document.getElementById('googleSignOutBtn');
    if (isSignedIn) {
      authorizeButton.style.display = 'none';
      signoutButton.style.display = 'inline-block';
    } else {
      authorizeButton.style.display = 'inline-block';
      signoutButton.style.display = 'none';
    }
  }

  /**
   *  Sign in the user upon button click.
   */
  public handleAuthClick(event) {
    gapi.auth2.getAuthInstance().signIn();
  }

  /**
   *  Sign out the user upon button click.
   */
  public handleSignoutClick(event) {
    gapi.auth2.getAuthInstance().signOut();
  }

  public isLoggedIntoGoogle():boolean{
    if (gapi.auth2) return gapi.auth2.getAuthInstance().isSignedIn.get();
    else return false;
  }

  public showNotification(message:string, action:string) {
    this.snackBar.open(message, action, {duration:5000});
  }
}
