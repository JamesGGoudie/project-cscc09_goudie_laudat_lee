import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, from } from 'rxjs';

import { BACK_ROUTES } from 'src/app/constants';

import {
  CreateWorkspaceForm,
  CreateWorkspaceRes,
  CreateWorkspaceVars,
  JoinWorkspaceForm,
  JoinWorkspaceRes,
  JoinWorkspaceVars
} from 'src/app/interfaces';

import { SignUpForm } from 'src/app/interfaces/forms/sign-up-form';
import { SignUpRes } from 'src/app/interfaces/responses/sign-up-response';
import { SignUpVars } from 'src/app/interfaces/request-variables/sign-up-vars';

@Injectable({
  providedIn: 'root'
})
export class WorkspaceControlService {

  public constructor(private http: HttpClient) {}

  public createWorkspace(
    form: CreateWorkspaceForm
  ): Observable<CreateWorkspaceRes> {
    const query = `mutation Create(
        $workspaceId: String!,
        $workspacePassword: String!,
        $userId: String!) {
      createWorkspace(
          workspaceId: $workspaceId,
          workspacePassword: $workspacePassword,
          userId: $userId)
    }`;
    const variables: CreateWorkspaceVars = {
      workspaceId: form.workspaceId,
      workspacePassword: form.workspacePassword,
      userId: form.userId
    }

    const httpOptions: {headers: HttpHeaders} = {
      headers: new HttpHeaders({
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      })
    };

    return this.http.post<CreateWorkspaceRes>(
        BACK_ROUTES.API,
        JSON.stringify({query, variables}),
        httpOptions);
  }

  public joinWorkspace(
    form: JoinWorkspaceForm
  ): Observable<JoinWorkspaceRes> {
    const query = `mutation Join(
        $workspaceId: String!,
        $workspacePassword: String!,
        $userId: String!) {
      joinWorkspace(
          workspaceId: $workspaceId,
          workspacePassword: $workspacePassword,
          userId: $userId)
    }`;
    const variables: JoinWorkspaceVars = {
      workspaceId: form.workspaceId,
      workspacePassword: form.workspacePassword,
      userId: form.userId
    }

    const httpOptions: {headers: HttpHeaders} = {
      headers: new HttpHeaders({
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      })
    };

    return this.http.post<JoinWorkspaceRes>(
        BACK_ROUTES.API,
        JSON.stringify({query, variables}),
        httpOptions);
  }

  public signUp(
    form: SignUpForm
  ): Observable<SignUpRes> {
    const query = `mutation Create(
        $emailAddress: String!,
        $username: String!,
        $password: String!,
        $workspaceId: String!) {
      signUp(
          emailAddress: $emailAddress,
          username: $username,
          password: $password,
          workspaceId: $workspaceId)
    }`;
    const variables: SignUpVars = {
      emailAddress: form.emailAddress,
      username: form.username,
      password: form.password,
      workspaceId: form.workspaceId
    }

    const httpOptions: {headers: HttpHeaders} = {
      headers: new HttpHeaders({
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      })
    };

    return this.http.post<SignUpRes>(
        BACK_ROUTES.API,
        JSON.stringify({query, variables}),
        httpOptions);
  }

}
