import { Injectable } from '@angular/core';

import { LS_KEYS } from 'src/app/constants';

@Injectable({
  providedIn: 'root'
})
export class WorkspaceStateService {

  private versionHistory: {[objId: string]: number} = {};

  public saveVersionHistory(objId: string, version: number): void {
    this.versionHistory[objId] = version;
  }

  public getVersionHistory(objId: string): number {
    const version = this.versionHistory[objId];

    return version != undefined ? version : -1;
  }

  public getPinnedObject(): string {
    return localStorage.getItem(LS_KEYS.PINNED_OBJ);
  }

  public setPinnedObject(id: string) {
    localStorage.setItem(LS_KEYS.PINNED_OBJ, id);
  }

  public getUserId(): string {
    return localStorage.getItem(LS_KEYS.USER_ID);
  }

  public setUserId(id: string) {
    localStorage.setItem(LS_KEYS.USER_ID, id);
  }

  public getWorkspaceId(): string {
    return localStorage.getItem(LS_KEYS.WORKSPACE_ID);
  }

  public setWorkspaceId(id: string) {
    localStorage.setItem(LS_KEYS.WORKSPACE_ID, id);
  }

}
