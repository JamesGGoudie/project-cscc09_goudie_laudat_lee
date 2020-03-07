import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { BACK_ROUTES } from 'src/app/constants';

import {
  CreateWorkspaceForm,
  CreateWorkspaceResponse,
  JoinWorkspaceForm,
  JoinWorkspaceResponse,
} from 'src/app/interfaces';

@Injectable({
  providedIn: 'root'
})
export class WorkspaceControlService {

  public constructor(private http: HttpClient) {}

  public createWorkspace(
    form: CreateWorkspaceForm
  ): Observable<CreateWorkspaceResponse> {
    const query = `query Create(
        $id: String!,
        $pass: String!,
        $user: String!) {
      createWorkspace(
          workspaceId: $id,
          workspacePassword: $pass,
          username: $user)
    }`;
    const variables = {
      id: form.workspaceId,
      pass: form.workspacePassword,
      user: form.username
    }

    const httpOptions: {headers: HttpHeaders} = {
      headers: new HttpHeaders({
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      })
    };

    return this.http.post<CreateWorkspaceResponse>(
        BACK_ROUTES.API,
        JSON.stringify({query, variables}),
        httpOptions);
  }

  public joinWorkspace(
    form: JoinWorkspaceForm
  ): Observable<JoinWorkspaceResponse> {
    const query = `query Join(
        $id: String!,
        $pass: String!,
        $user: String!) {
      joinWorkspace(
          workspaceId: $id,
          workspacePassword: $pass,
          username: $user)
    }`;
    const variables = {
      id: form.workspaceId,
      pass: form.workspacePassword,
      user: form.username
    }

    const httpOptions: {headers: HttpHeaders} = {
      headers: new HttpHeaders({
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      })
    };

    return this.http.post<JoinWorkspaceResponse>(
        BACK_ROUTES.API,
        JSON.stringify({query, variables}),
        httpOptions);
  }

}
