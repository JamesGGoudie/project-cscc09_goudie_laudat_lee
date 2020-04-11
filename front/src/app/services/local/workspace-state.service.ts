import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class WorkspaceStateService {

  private joinedWorkspace: boolean = false;

  private workspaceId: string;
  private userId: string;
  private pinnedObj: string;

  private pinnedByOthers: string[] = [];

  private versionHistory: {[objId: string]: number} = {};

  public setJoinedWorkspace(value: boolean): void {
    this.joinedWorkspace = value;
  }

  public getJoinedWorkspace(): boolean {
    return this.joinedWorkspace;
  }

  public saveVersionHistory(objId: string, version: number): void {
    this.versionHistory[objId] = version;
  }

  public getVersionHistory(objId: string): number {
    const version = this.versionHistory[objId];

    return version != undefined ? version : -1;
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
