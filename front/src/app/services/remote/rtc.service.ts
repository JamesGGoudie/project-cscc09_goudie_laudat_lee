import { Injectable, NgZone } from '@angular/core';
import { Observable, Subject } from 'rxjs';

import Peer from 'peerjs';
import * as THREE from 'three';

import { RtcMessageType } from 'src/app/enums';

import {
  ObjectInfo,
  RtcCopyWsMsg,
  RtcCreateObjMsg,
  RtcDeleteObjMsg,
  RtcMessage,
  RtcModifyObjMsg,
  RtcPinObjMsg,
  RtcUnpinObjMsg
} from 'src/app/interfaces';

import { WorkspaceStateService } from '../local';
import { MeshBasicMaterial } from 'three';

@Injectable({
  providedIn: 'root'
})
export class RtcService {

  private readonly onPinObject: Subject<string> = new Subject<string>();
  private readonly onUnpinObject: Subject<string> = new Subject<string>();
  private readonly onDeleteObject: Subject<string> = new Subject<string>();
  private readonly onCreateObject: Subject<ObjectInfo> =
      new Subject<ObjectInfo>();
  private readonly onModifyObject: Subject<ObjectInfo> =
      new Subject<ObjectInfo>();
  private readonly onCopyWorkspace: Subject<ObjectInfo[]> =
      new Subject<ObjectInfo[]>();

  private peer: Peer;
  private readonly connections: Peer.DataConnection[] = [];

  public constructor(
    private readonly zone: NgZone,
    private readonly state: WorkspaceStateService
  ) {}

  public createPeer(id: string): Observable<void> {
    this.peer = new Peer(id);

    const s: Subject<void> = new Subject();

    this.peer.on('open', () => {
      s.next();
    });

    this.peer.on('connection', (conn) => {
      this.setUpConnection(conn);
    });

    return s;
  }

  public connectToPeers(ids: string[]): Observable<void> {
    let i = 0;
    const s: Subject<void> = new Subject();

    for (const id of ids) {
      const conn = this.peer.connect(id);
      this.setUpConnection(conn);

      conn.on('open', () => {
        ++i;

        if (i === ids.length) {
          s.next();
        }
      });
    }

    return s;
  }

  public sendPinObjectMessage(id: string): void {
    const data: RtcPinObjMsg = {
      type: RtcMessageType.PinObject,
      objectId: id
    };

    this.send(data);
  }

  public sendUnpinObjectMessage(id: string): void {
    const data: RtcUnpinObjMsg = {
      type: RtcMessageType.UnpinObject,
      objectId: id
    };

    this.send(data);
  }

  public sendDeleteObjectMessage(id: string): void {
    const data: RtcDeleteObjMsg = {
      type: RtcMessageType.DeleteObject,
      objectId: id
    }

    this.send(data);
  }

  public sendCreateObjectMessage(obj: THREE.Mesh): void {
    const data: RtcCreateObjMsg = {
      type: RtcMessageType.CreateObject,
      objectInfo: this.convertMeshToObjInfo(obj)
    }

    this.send(data);
  }

  public sendModifyObjectMessage(obj: THREE.Mesh): void {
    const data: RtcModifyObjMsg = {
      type: RtcMessageType.ModifyObject,
      objectInfo: this.convertMeshToObjInfo(obj)
    }

    this.send(data);
  }

  public pinObject(): Observable<string> {
    return this.onPinObject;
  }

  public unpinObject(): Observable<string> {
    return this.onUnpinObject;
  }

  public deleteObject(): Observable<string> {
    return this.onDeleteObject;
  }

  public createObject(): Observable<ObjectInfo> {
    return this.onCreateObject;
  }

  public modifyObject(): Observable<ObjectInfo> {
    return this.onModifyObject;
  }

  public copyWorkspace(): Observable<ObjectInfo[]> {
    return this.onCopyWorkspace;
  }

  private convertMeshToObjInfo(mesh: THREE.Mesh): ObjectInfo {
    const mat: MeshBasicMaterial = mesh.material as MeshBasicMaterial;

    return {
      objectId: mesh.uuid,
      version: 0,
      name: mesh.name,
      geometryType: mesh.geometry.type,
      position: [
        mesh.position.x,
        mesh.position.y,
        mesh.position.z
      ],
      scale: [
        mesh.scale.x,
        mesh.scale.y,
        mesh.scale.z
      ],
      rotation: [
        mesh.rotation.x,
        mesh.rotation.y,
        mesh.rotation.z
      ],
      materialColorHex: mat.color.getHexString()
    };
  }

  private send(data: RtcMessage): void {
    console.log(data);
    for (const conn of this.connections) {
      conn.send(data);
    }
  }

  private setUpConnection(conn: Peer.DataConnection) {
    console.log(conn);

    this.connections.push(conn);

    conn.on('data', (data: RtcMessage) => {
      console.log(data);
      switch (data.type) {
        case RtcMessageType.CopyWorkspace:
          this.processCopyWorkspace(data as RtcCopyWsMsg);
          break;
        case RtcMessageType.CreateObject:
          this.processCreateObject(data as RtcCreateObjMsg);
          break;
        case RtcMessageType.DeleteObject:
          this.processDeleteObject(data as RtcDeleteObjMsg);
          break;
        case RtcMessageType.ModifyObject:
          this.processModifyObject(data as RtcModifyObjMsg);
          break;
        case RtcMessageType.PinObject:
          this.processPinObject(data as RtcPinObjMsg);
          break;
        case RtcMessageType.UnpinObject:
          this.processUnpinObject(data as RtcUnpinObjMsg);
          break;
        default:
          break;
      }
    });
  }

  private processPinObject(data: RtcPinObjMsg) {
    this.onPinObject.next(data.objectId);
  }

  private processUnpinObject(data: RtcUnpinObjMsg) {
    this.onUnpinObject.next(data.objectId);
  }

  private processDeleteObject(data: RtcDeleteObjMsg) {
    this.onDeleteObject.next(data.objectId);
  }

  private processCreateObject(data: RtcCreateObjMsg) {
    this.onCreateObject.next(data.objectInfo);
  }

  private processModifyObject(data: RtcModifyObjMsg) {
    this.onModifyObject.next(data.objectInfo);
  }

  private processCopyWorkspace(data: RtcCopyWsMsg) {
    this.onCopyWorkspace.next(data.workspaceObjects);
  }

}
