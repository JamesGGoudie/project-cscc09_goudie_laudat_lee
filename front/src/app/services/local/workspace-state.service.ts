import { Injectable } from '@angular/core';

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
   * The IDs of objects pinned by other users.
   */
  private pinnedByOthers: string[] = [];

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

  public addOtherUsersPin(id: string): void {
    if (!this.isPinnedByOther(id)) {
      this.pinnedByOthers.push(id);
    }
  }

  public isPinnedByOther(objectId: string): boolean {
    return this.pinnedByOthers.findIndex((id: string): boolean => {
      return id === objectId;
    }) > -1;
  }

  public removeOtherUsersPin(id: string): void {
    this.pinnedByOthers.splice(this.pinnedByOthers.findIndex((objId) => {
      return objId === id;
    }), 1);
  }

  public getOtherUsersPins(): string[] {
    return this.pinnedByOthers;
  }

}
