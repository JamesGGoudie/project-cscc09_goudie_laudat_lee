import { Injectable } from '@angular/core';

import { LS_KEYS } from 'src/app/constants';

@Injectable({
  providedIn: 'root'
})
export class WorkspaceStateService {

  private workspaceId: string;
  private userId: string;
  private pinnedObj: string;

  private pinnedByOthers: string[] = [];

  private versionHistory: {[objId: string]: number} = {};

  public saveVersionHistory(objId: string, version: number): void {
    this.versionHistory[objId] = version;
  }

  public getVersionHistory(objId: string): number {
    const version = this.versionHistory[objId];

    return version != undefined ? version : -1;
  }

  public getCurrentUsersPin(): string {
    // return localStorage.getItem(LS_KEYS.PINNED_OBJ);
    return this.pinnedObj;
  }

  public setCurrentUsersPin(id: string): void {
    // localStorage.setItem(LS_KEYS.PINNED_OBJ, id);
    this.pinnedObj = id;
  }

  public getUserId(): string {
    // return localStorage.getItem(LS_KEYS.USER_ID);
    return this.userId;
  }

  public setUserId(id: string): void {
    // localStorage.setItem(LS_KEYS.USER_ID, id);
    this.userId = id;
  }

  public getWorkspaceId(): string {
    // return localStorage.getItem(LS_KEYS.WORKSPACE_ID);
    return this.workspaceId;
  }

  public setWorkspaceId(id: string): void {
    // localStorage.setItem(LS_KEYS.WORKSPACE_ID, id);
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

}
