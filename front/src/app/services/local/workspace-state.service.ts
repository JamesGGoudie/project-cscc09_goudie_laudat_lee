import { Injectable } from '@angular/core';

import { PinInfo } from 'src/app/interfaces';

/**
 * Contains information about the current state of the site.
 *
 * Effectively global variables.
 */
@Injectable({
  providedIn: 'root'
})
export class WorkspaceStateService {

  /**
   * True iff the user is in a workspace.
   */
  private joinedWorkspace: boolean = false;
  /**
   * The ID of the workspace.
   */
  private workspaceId: string;
  /**
   * The ID of the user.
   *
   * This is not the same as the Peer JS ID.
   */
  private userId: string;
  /**
   * The ID of the object pinned by the user.
   */
  private pinnedObj: string;
  /**
   * The IDs of objects and the peer ID of the user who has the object pinned.
   */
  private pinnedByOthers: PinInfo[] = [];

  public setJoinedWorkspace(value: boolean): void {
    this.joinedWorkspace = value;
  }

  public getJoinedWorkspace(): boolean {
    return this.joinedWorkspace;
  }

  public getCurrentUsersPin(): string {
    return this.pinnedObj;
  }

  public setCurrentUsersPin(id: string): void {
    this.pinnedObj = id;
  }

  public getUserId(): string {
    return this.userId;
  }

  public setUserId(id: string): void {
    this.userId = id;
  }

  public getWorkspaceId(): string {
    return this.workspaceId;
  }

  public setWorkspaceId(id: string): void {
    this.workspaceId = id;
  }

  public addOtherUsersPin(pin: PinInfo): void {
    if (!this.isPinnedByOther(pin.oId)) {
      this.pinnedByOthers.push({oId: pin.oId, pId: pin.pId});
    }
  }

  public isPinnedByOther(objectId: string): boolean {
    return this.findObjectIndex(objectId) > -1;
  }

  public removeOtherUsersPin(objectId: string): void {
    this.removePinInfo(this.findObjectIndex(objectId));
  }

  public getObjectsPinnedByOthers(): PinInfo[] {
    return this.pinnedByOthers;
  }

  public removeUserTraces(peerId: string): void {
    this.removePinInfo(this.findPeerIndex(peerId));
  }

  private findObjectIndex(objectId: string): number {
    return this.pinnedByOthers.findIndex((info: PinInfo): boolean => {
      return info.oId === objectId;
    });
  }

  private findPeerIndex(peerId: string): number {
    return this.pinnedByOthers.findIndex((info: PinInfo): boolean => {
      return info.pId === peerId;
    });
  }

  private removePinInfo(i: number): void {
    if (i > -1) {
      this.pinnedByOthers.splice(i, 1);
    }
  }

}
