import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

import Peer from 'peerjs';
import * as THREE from 'three';
import { MeshBasicMaterial } from 'three';

import { RtcMessageType } from 'src/app/enums';

import {
  ObjectInfo,
  PinInfo,
  RtcConnVerifiedMsg,
  RtcCopyWsReq,
  RtcCopyWsRes,
  RtcCreateObjMsg,
  RtcDeleteObjMsg,
  RtcMessage,
  RtcModifyObjMsg,
  RtcPinObjMsg,
  RtcUnpinObjMsg,
  VerifyPeerRes
} from 'src/app/interfaces';

import { environment } from 'src/environments/environment';

import { WorkspaceStateService } from '../local';

import { WorkspaceControlService } from './workspace-control.service';

/**
 * Facade for all web-socket (RTC) interactions.
 */
@Injectable({
  providedIn: 'root'
})
export class RtcService {

  private readonly onConnectionVerified: Subject<string> =
      new Subject<string>();

  private readonly onPinObject: Subject<PinInfo> = new Subject<PinInfo>();
  private readonly onUnpinObject: Subject<string> = new Subject<string>();
  private readonly onDeleteObject: Subject<string> = new Subject<string>();
  private readonly onCreateObject: Subject<ObjectInfo> =
      new Subject<ObjectInfo>();
  private readonly onModifyObject: Subject<ObjectInfo> =
      new Subject<ObjectInfo>();
  private readonly onCopyWorkspaceReq: Subject<string> = new Subject<string>();
  private readonly onCopyWorkspaceRes: Subject<RtcCopyWsRes> =
      new Subject<RtcCopyWsRes>();

  /**
   * The peer of the client.
   */
  private peer: Peer;
  /**
   * All other peers in the workspace.
   */
  private readonly peers: string[] = [];
  /**
   * A map between peer IDs and connections.
   *
   * This is supposedly stored in the client peer as well, but the
   * documentation indicates that a separate object is recommended.
   */
  private readonly connections: Map<string, Peer.DataConnection> =
      new Map<string, Peer.DataConnection>();
  private readonly verifiedConnections: Map<string, boolean> =
      new Map<string, boolean>();

  public constructor(
    private readonly wsControlService: WorkspaceControlService,
    private readonly state: WorkspaceStateService,
  ) {
    this.onConnectionVerified.subscribe((peerId: string): void => {
      this.verifiedConnections.set(peerId, true);
    })
  }

  public getPeerId(): string {
    return this.peer.id;
  }

  /**
   * Creates the Peer used for RTC using the given ID.
   *
   * Returns an observable that emits once the peer is opened.
   *
   * @param id
   */
  public createPeer(id: string): Observable<void> {
    this.peer = new Peer(id, {
      host: environment.peerHost,
      key: environment.peerKey,
      path: environment.peerPath,
      port: environment.peerPort
    });

    const s: Subject<void> = new Subject();

    this.peer.on('open', (): void => {
      s.next();
    });

    // When the peer connects to another peer...
    this.peer.on('connection', (conn: Peer.DataConnection): void => {
      this.prepareConnection(conn);

      // Check that the peer belongs to the workspace.
      // Any messages received before they are verified will be ignored.
      this.wsControlService.verifyPeer(conn.peer, this.state.getWorkspaceId()
          ).subscribe((res: VerifyPeerRes) => {
        // If so...
        if (res.data.verifyPeer.valid) {
          // ...perform the initial set-up.
          this.setUpConnectionEvents(conn);
          this.onConnectionVerified.next(conn.peer);
          this.sendVerifiedConnectionMessage(conn.peer);
        } else {
          // Otherwise, close the connection.
          conn.close();
          this.removeConnectionTraces(conn.peer);
        }
      });
    });

    return s;
  }

  /**
   * Connect the current user to every peer in the given list.
   *
   * Returns an observable that emits once the user has attempted to attempt to
   * every peer.
   * It is not required to connect successfully to every peer for the
   * observable to emit.
   *
   * @param ids
   */
  public connectToPeers(ids: string[]): Observable<void> {
    let i = 0;
    const s: Subject<void> = new Subject();

    /**
     * Count the poke to the peer.
     *
     * Triggers the observable once every peer has been poked.
     */
    const countConn: () => void = (): void => {
      ++i;

      if (i === ids.length) {
        s.next();
      }
    };

    this.peer.on('error', (err): void => {
      // The peer failed to connect.
      console.error(err);
      countConn();
    });

    for (const id of ids) {
      const conn = this.peer.connect(id);

      conn.on('open', (): void => {
        // Perform the initial set-up.
        this.prepareConnection(conn);
        this.setUpConnectionEvents(conn);
        countConn();
      });
    }

    return s;
  }

  public destroyPeer(): void {
    if (this.peer) {
      this.peer.destroy();
    }
  }

  /**
   * Indicate to all other peers that you have pinned this object.
   *
   * Other peers should not be able to select it.
   *
   * @param id
   */
  public sendPinObjectMessage(id: string): void {
    const data: RtcPinObjMsg = {
      type: RtcMessageType.PinObject,
      objectId: id
    };

    this.sendToAll(data);
  }

  /**
   * Indicate to all other peers that you have unpinned this object.
   *
   * Other users can not select it.
   *
   * @param id
   */
  public sendUnpinObjectMessage(id: string): void {
    const data: RtcUnpinObjMsg = {
      type: RtcMessageType.UnpinObject,
      objectId: id
    };

    this.sendToAll(data);
  }

  /**
   * Indicate to all other peers that this object has been deleted from the
   * workspace.
   *
   * @param id
   */
  public sendDeleteObjectMessage(id: string): void {
    const data: RtcDeleteObjMsg = {
      type: RtcMessageType.DeleteObject,
      objectId: id
    }

    this.sendToAll(data);
  }

  /**
   * Indicate to all other peers that this object has just been created and did
   * not previously exist.
   *
   * @param obj
   */
  public sendCreateObjectMessage(obj: THREE.Mesh): void {
    const data: RtcCreateObjMsg = {
      type: RtcMessageType.CreateObject,
      objectInfo: this.convertMeshToObjInfo(obj)
    }

    this.sendToAll(data);
  }

  /**
   * Indicate to all other peers that this object has been modified.
   *
   * @param obj
   */
  public sendModifyObjectMessage(obj: THREE.Mesh): void {
    const data: RtcModifyObjMsg = {
      type: RtcMessageType.ModifyObject,
      objectInfo: this.convertMeshToObjInfo(obj)
    }

    this.sendToAll(data);
  }

  /**
   * Request to the arbiter the current configuration of the workspace.
   *
   * This includes current objects and pins.
   */
  public sendCopyWorkspaceReq(): void {
    const data: RtcCopyWsReq = {
      type: RtcMessageType.CopyWorkspaceReq
    };

    this.sendToArbiter(data);
  }

  /**
   * Inform the peer that these are the current objects and pins in the\
   * workspace.
   *
   * @param objs
   * @param pinnedObjects
   * @param peer
   */
  public sendCopyWorkspaceRes(
    objs: THREE.Mesh[],
    pinnedObjects: PinInfo[],
    peer: string
  ): void {
    const data: RtcCopyWsRes = {
      type: RtcMessageType.CopyWorkspaceRes,
      pins: pinnedObjects,
      workspaceObjects: objs.map((obj: THREE.Mesh): ObjectInfo => {
          return this.convertMeshToObjInfo(obj);
        })
    };

    this.sendToPeer(data, peer);
  }

  public pinObject(): Observable<PinInfo> {
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

  public copyWorkspaceRes(): Observable<RtcCopyWsRes> {
    return this.onCopyWorkspaceRes;
  }

  /**
   * Sends a message to the peer indicating that they have been verified to be
   * in the workspace.
   *
   * The client will now exchange messages with the client.
   *
   * @param peerId
   */
  private sendVerifiedConnectionMessage(peerId: string): void {
    const data: RtcConnVerifiedMsg = {
      type: RtcMessageType.ConnectionVerified
    }

    this.sendToPeer(data, peerId);
  }

  private convertMeshToObjInfo(mesh: THREE.Mesh): ObjectInfo {
    const mat: MeshBasicMaterial = mesh.material as MeshBasicMaterial;

    let info = {
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
    // manually set geometry type for Pyramids
    if (mesh.geometry instanceof THREE.ConeBufferGeometry && mesh.geometry.parameters.radialSegments == 4) {
      info.geometryType = 'ConeBufferGeometry-Pyramid';
    }
    return info;
  }

  /**
   * Send a message to the arbiter.
   *
   * The arbiter is the user that is considered the head of the project.
   *
   * Currently not implemented.
   * Instead sends a message to the first peer in the list of peers.
   *
   * @param data
   */
  private sendToArbiter(data: RtcMessage): void {
    this.send(data, this.connections.get(this.peers[0]));
  }

  /**
   * Sends a message to a specific peer.
   *
   * @param data
   * @param peer
   */
  private sendToPeer(data: RtcMessage, peer: string): void {
    this.send(data, this.connections.get(peer));
  }

  /**
   * Sends a message to all peers.
   *
   * @param data
   */
  private sendToAll(data: RtcMessage): void {
    this.connections.forEach((conn: Peer.DataConnection): void => {
      this.send(data, conn);
    });
  }

  private send(data: RtcMessage, conn: Peer.DataConnection): void {
    // If the connection is open and establisehd...
    if (conn.open && this.verifiedConnections.get(conn.peer)) {
      // ...then send the message.
      conn.send(data);
    } else if (!conn.open) {
      // If the connection is not open, then wait for it to open.
      this.sendOnConnOpen(data, conn);
    } else if (!this.verifiedConnections.get(conn.peer)) {
      // If the connection is not established, then wait for it to be
      // established.
      this.sendOnConnVerified(data, conn);
    }
  }

  /**
   * Trys to send the message once the connection has been openend.
   *
   * If the connection is not verified, then it will will wait until the
   * connection is verified before sending the message.
   *
   * @param data
   * @param conn
   */
  private sendOnConnOpen(data: RtcMessage, conn: Peer.DataConnection): void {
    conn.on('open', (): void => {
      // ...then try to send the message.

      if (this.verifiedConnections.get(conn.peer)) {
        conn.send(data);
      } else {
        this.sendOnConnVerified(data, conn);
      }
    });
  }

  /**
   * Trys to send the message once the connection has been verified.
   *
   * If the connection is not open, then it will wait until the connection is
   * open before sending the message.
   *
   * @param data
   * @param conn
   */
  private sendOnConnVerified(
    data: RtcMessage, conn: Peer.DataConnection
  ): void {
    this.onConnectionVerified.subscribe((peerId: string): void => {
      if (peerId === conn.peer) {
        if (conn.open) {
          conn.send(data);
        } else {
          this.sendOnConnOpen(data, conn);
        }
      }
    });
  }

  private prepareConnection(conn: Peer.DataConnection): void {
    this.peers.push(conn.peer);
    this.connections.set(conn.peer, conn);
    this.verifiedConnections.set(conn.peer, false);
  }

  private removeConnectionTraces(peerId: string): void {
    const i = this.peers.findIndex((p: string): boolean => {
      return peerId === p;
    });

    if (i > -1) {
      this.peers.splice(i, 1);
    }

    this.connections.delete(peerId);
    this.verifiedConnections.delete(peerId);

    this.state.removeUserTraces(peerId);
  }

  private setUpConnectionEvents(conn: Peer.DataConnection): void {
    conn.on('data', (data: RtcMessage): void => {
      switch (data.type) {
        case RtcMessageType.ConnectionVerified: {
          this.processConnectionVerified(conn.peer);
          break;
        }
        case RtcMessageType.CopyWorkspaceReq:
          this.processCopyWorkspaceReq(conn.peer);
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
          this.processPinObject(data as RtcPinObjMsg, conn.peer);
          break;
        case RtcMessageType.UnpinObject:
          this.processUnpinObject(data as RtcUnpinObjMsg);
          break;
        default:
          break;
      }
    });

    conn.on('error', (err: any): void => {
      console.error(err);
      this.removeConnectionTraces(conn.peer);
    });

    conn.on('close', (): void => {
      this.removeConnectionTraces(conn.peer);
    });
  }

  private processConnectionVerified(peerId: string): void {
    this.onConnectionVerified.next(peerId);
  }

  private processPinObject(data: RtcPinObjMsg, peerId: string): void {
    this.onPinObject.next({oId: data.objectId, pId: peerId});
  }

  private processUnpinObject(data: RtcUnpinObjMsg): void {
    this.onUnpinObject.next(data.objectId);
  }

  private processDeleteObject(data: RtcDeleteObjMsg): void {
    this.onDeleteObject.next(data.objectId);
  }

  private processCreateObject(data: RtcCreateObjMsg): void {
    this.onCreateObject.next(data.objectInfo);
  }

  private processModifyObject(data: RtcModifyObjMsg): void {
    this.onModifyObject.next(data.objectInfo);
  }

  private processCopyWorkspaceReq(peerId: string): void {
    this.onCopyWorkspaceReq.next(peerId);
  }

  private processCopyWorkspaceRes(data: RtcCopyWsRes): void {
    this.onCopyWorkspaceRes.next(data);
  }

}
