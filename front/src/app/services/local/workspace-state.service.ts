import { Injectable } from '@angular/core';

import { LS_KEYS } from 'src/app/constants';

@Injectable({
  providedIn: 'root'
})
export class WorkspaceStateService {

  public getWorkspaceId(): string {
    return localStorage.getItem(LS_KEYS.WORKSPACE_ID);
  }

  public setWorkspaceId(id: string) {
    localStorage.setItem(LS_KEYS.WORKSPACE_ID, id);
  }

}
