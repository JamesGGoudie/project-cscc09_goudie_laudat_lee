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
import { SignInForm } from 'src/app/interfaces/forms/sign-in-form';
import { SignInRes } from 'src/app/interfaces/responses/sign-in-response';
import { SignInVars } from 'src/app/interfaces/request-variables/sign-in-vars';
import { SignOutRes } from 'src/app/interfaces/responses/sign-out-response';
import { SignOutVars } from 'src/app/interfaces/request-variables/sign-out-vars';
import { SignOutForm } from 'src/app/interfaces/forms/sign-out-form';
import { GetContactForm } from 'src/app/interfaces/forms/get-contact-form';
import { GetContactRes } from 'src/app/interfaces/responses/get-contact-response';
import { GetContactVars } from 'src/app/interfaces/request-variables/get-contact-vars';

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
        $password: String!) {
      signUp(
          emailAddress: $emailAddress,
          username: $username,
          password: $password)
    }`;
    const variables: SignUpVars = {
      emailAddress: form.emailAddress,
      username: form.username,
      password: form.password,
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

  public signIn(
    form: SignInForm
  ): Observable<SignInRes> {
    const query = `mutation Create(
        $username: String!,
        $password: String!) {
      signIn(
          username: $username,
          password: $password)
    }`;
    const variables: SignInVars = {
      username: form.username,
      password: form.password,
    }

    const httpOptions: {headers: HttpHeaders} = {
      headers: new HttpHeaders({
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      })
    };

    return this.http.post<SignInRes>(
        BACK_ROUTES.API,
        JSON.stringify({query, variables}),
        httpOptions);
  }

  public signOut(
    form: SignOutForm
  ): Observable<SignOutRes> {
    const query = `mutation Create(
        $username: String!,
        $password: String!) {
      signOut(
          username: $username,
          password: $password)
    }`;
    const variables: SignOutVars = {
      username: form.username,
      password: form.password,
    }

    const httpOptions: {headers: HttpHeaders} = {
      headers: new HttpHeaders({
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      })
    };

    return this.http.post<SignOutRes>(
        BACK_ROUTES.API,
        JSON.stringify({query, variables}),
        httpOptions);
  }

  public getContact(
    form: GetContactForm
  ): Observable<GetContactRes> {
    const query = `mutation Create(
        $username: String!) {
      getContact(
          username: $username)
    }`;
    const variables: GetContactVars = {
      username: form.username
    }

    const httpOptions: {headers: HttpHeaders} = {
      headers: new HttpHeaders({
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      })
    };

    return this.http.post<GetContactRes>(
        BACK_ROUTES.API,
        JSON.stringify({query, variables}),
        httpOptions);
  }

}
