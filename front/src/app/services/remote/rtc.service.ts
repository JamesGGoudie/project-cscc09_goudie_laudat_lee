import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

import Peer from 'peerjs';
import * as THREE from 'three';
import { MeshBasicMaterial } from 'three';

import { RtcMessageType } from 'src/app/enums';

import {
  ObjectInfo,
  RtcCopyWsReq,
  RtcCopyWsRes,
  RtcCreateObjMsg,
  RtcDeleteObjMsg,
  RtcMessage,
  RtcModifyObjMsg,
  RtcPinObjMsg,
  RtcUnpinObjMsg
} from 'src/app/interfaces';

import { environment } from 'src/environments/environment';

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
  private readonly onCopyWorkspaceReq: Subject<string> = new Subject<string>();
  private readonly onCopyWorkspaceRes: Subject<ObjectInfo[]> =
      new Subject<ObjectInfo[]>();

  private peer: Peer;
  private readonly peers: string[] = [];
  private readonly connections: Map<string, Peer.DataConnection> =
      new Map<string, Peer.DataConnection>();

  public createPeer(id: string): Observable<void> {
    this.peer = new Peer(id, {
      host: environment.peerHost,
      key: environment.peerKey,
      path: environment.peerPath,
      port: environment.peerPort,
    });

    const s: Subject<void> = new Subject();

    this.peer.on('open', () => {
      s.next();
    });

    this.peer.on('connection', (conn) => {
      this.setUpConnection(conn);

      conn.on('error', (err): void => {
        console.error(err);
      });
    });

    return s;
  }

  public connectToPeers(ids: string[]): Observable<void> {
    let i = 0;
    const s: Subject<void> = new Subject();

    const countConn: () => void = () => {
      ++i;

      if (i === ids.length) {
        s.next();
      }
    };

    for (const id of ids) {
      const conn = this.peer.connect(id);

      this.peer.on('error', (err) => {
        console.error(err);
        countConn();
      });

      conn.on('open', () => {
        this.setUpConnection(conn);
        countConn();
      });

      conn.on('error', (err): void => {
        console.error(err);
      });
    }

    return s;
  }

  public sendPinObjectMessage(id: string): void {
    const data: RtcPinObjMsg = {
      type: RtcMessageType.PinObject,
      objectId: id
    };

    this.sendToAll(data);
  }

  public sendUnpinObjectMessage(id: string): void {
    const data: RtcUnpinObjMsg = {
      type: RtcMessageType.UnpinObject,
      objectId: id
    };

    this.sendToAll(data);
  }

  public sendDeleteObjectMessage(id: string): void {
    const data: RtcDeleteObjMsg = {
      type: RtcMessageType.DeleteObject,
      objectId: id
    }

    this.sendToAll(data);
  }

  public sendCreateObjectMessage(obj: THREE.Mesh): void {
    const data: RtcCreateObjMsg = {
      type: RtcMessageType.CreateObject,
      objectInfo: this.convertMeshToObjInfo(obj)
    }

    this.sendToAll(data);
  }

  public sendModifyObjectMessage(obj: THREE.Mesh): void {
    const data: RtcModifyObjMsg = {
      type: RtcMessageType.ModifyObject,
      objectInfo: this.convertMeshToObjInfo(obj)
    }

    this.sendToAll(data);
  }

  public sendCopyWorkspaceReq(): void {
    const data: RtcCopyWsReq = {
      type: RtcMessageType.CopyWorkspaceReq
    };

    this.sendToArbiter(data);
  }

  public sendCopyWorkspaceRes(obj: THREE.Mesh[], peer: string): void {
    const data: RtcCopyWsRes = {
      type: RtcMessageType.CopyWorkspaceRes,
      workspaceObjects: obj.map(obj => this.convertMeshToObjInfo(obj))
    };

    this.sendToPeer(data, peer);
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

  public copyWorkspaceReq(): Observable<string> {
    return this.onCopyWorkspaceReq;
  }

  public copyWorkspaceRes(): Observable<ObjectInfo[]> {
    return this.onCopyWorkspaceRes;
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

  private sendToArbiter(data: RtcMessage): void {
    console.log(data);

    this.send(data, this.connections.get(this.peers[0]));
  }

  private sendToPeer(data: RtcMessage, peer: string): void {
    console.log(data);
    console.log(peer);

    this.send(data, this.connections.get(peer));
  }

  private sendToAll(data: RtcMessage): void {
    console.log(data);

    this.connections.forEach((conn: Peer.DataConnection): void => {
      this.send(data, conn);
    });
  }

  private send(data: RtcMessage, conn: Peer.DataConnection): void {
    if (conn.open) {
      conn.send(data);
    } else {
      conn.on('open', () => {
        conn.send(data);
      });
    }
  }

  private setUpConnection(conn: Peer.DataConnection) {
    this.peers.push(conn.peer);
    this.connections.set(conn.peer, conn);

    conn.on('data', (data: RtcMessage) => {
      console.log(data);
      console.log(conn.peer);
      switch (data.type) {
        case RtcMessageType.CopyWorkspaceReq:
          this.processCopyWorkspaceReq(data as RtcCopyWsReq, conn.peer);
          break;
        case RtcMessageType.CopyWorkspaceRes:
          this.processCopyWorkspaceRes(data as RtcCopyWsRes);
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

  private processCopyWorkspaceReq(data: RtcCopyWsReq, peer: string) {
    this.onCopyWorkspaceReq.next(peer);
  }

  private processCopyWorkspaceRes(data: RtcCopyWsRes) {
    this.onCopyWorkspaceRes.next(data.workspaceObjects);
  }

}
