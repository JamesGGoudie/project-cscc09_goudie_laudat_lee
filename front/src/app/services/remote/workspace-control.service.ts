import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

import { CreateWorkspaceForm, JoinWorkspaceForm } from 'src/app/interfaces';

@Injectable({
  providedIn: 'root'
})
export class WorkspaceControlService {

  public constructor(private http: HttpClient) {}

  public createWorkspace(form: CreateWorkspaceForm): void {

  }

  public joinWorkspace(form: JoinWorkspaceForm): void {

  }

}
