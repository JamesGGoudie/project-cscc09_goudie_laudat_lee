import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { Mesh, MeshBasicMaterial } from 'three';

import { BACK_ROUTES } from 'src/app/constants';

import {
  DeleteObjectRes,
  DeleteObjectVars,
  GetWorkspaceRes,
  GetWorkspaceVars,
  PinObjectRes,
  PinObjectVars,
  ReportChangesRes,
  ReportChangesVars,
  UnpinObjectRes,
  UnpinObjectVars,
} from 'src/app/interfaces';

@Injectable({
  providedIn: 'root'
})
export class WorkspaceSyncService {

  public constructor(private http: HttpClient) {}

  public pinObject(
    workspaceId: string, objectId: string, userId: string
  ): Observable<PinObjectRes> {
    const query = `query Pin(
        $workspaceId: String!,
        $objectId: String!,
        $userId: String!) {
      pinObject(
          workspaceId: $workspaceId,
          objectId: $objectId,
          userId: $userId)
    }`;
    const variables: PinObjectVars = {
      objectId,
      workspaceId,
      userId
    };

    const httpOptions: {headers: HttpHeaders} = {
      headers: new HttpHeaders({
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      })
    };

    return this.http.post<PinObjectRes>(
        BACK_ROUTES.API,
        JSON.stringify({query, variables}),
        httpOptions);
  }

  public unpinObject(
    workspaceId: string, objectId: string, userId: string
  ): Observable<UnpinObjectRes> {
    const query = `query Unpin(
        $workspaceId: String!,
        $userId: String!,
        $objectId: String!) {
      unpinObject(
          workspaceId: $workspaceId,
          userId: $userId
          objectId: $objectId)
    }`;
    const variables: UnpinObjectVars = {
      objectId,
      userId,
      workspaceId
    };

    const httpOptions: {headers: HttpHeaders} = {
      headers: new HttpHeaders({
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      })
    };

    return this.http.post<UnpinObjectRes>(
        BACK_ROUTES.API,
        JSON.stringify({query, variables}),
        httpOptions);
  }

  public getWorkspace(workspaceId: string): Observable<GetWorkspaceRes> {
    const query = `query GetWorkspace(
        $workspaceId: String!) {
      getWorkspace(
          workspaceId: $workspaceId) {
            objectId,
            version,
            name,
            geometryType,
            position,
            rotation,
            scale,
            materialColorHex
          }
    }`;
    const variables: GetWorkspaceVars = {
      workspaceId
    };

    const httpOptions: {headers: HttpHeaders} = {
      headers: new HttpHeaders({
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      })
    };

    return this.http.post<GetWorkspaceRes>(
        BACK_ROUTES.API,
        JSON.stringify({query, variables}),
        httpOptions);
  }

  public deleteObject(
    objectId: string,
    userId: string,
    workspaceId: string
  ): Observable<DeleteObjectRes> {
    const query = `mutation DeleteObject(
        $objectId: String!,
        $userId: String!,
        $workspaceId: String!) {
      deleteObject(
        objectId: $objectId,
        userId: $userId,
        workspaceId: $workspaceId)
    }`;
    const variables: DeleteObjectVars = {
      objectId: objectId,
      userId: userId,
      workspaceId: workspaceId
    };

    const httpOptions: {headers: HttpHeaders} = {
      headers: new HttpHeaders({
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      })
    };

    return this.http.post<DeleteObjectRes>(
        BACK_ROUTES.API,
        JSON.stringify({query, variables}),
        httpOptions);
  }

  public reportChanges(
    obj: Mesh,
    userId: string,
    workspaceId: string,
    version: number
  ): Observable<ReportChangesRes> {
    const mat: MeshBasicMaterial = obj.material as MeshBasicMaterial;

    const query = `mutation ReportChanges(
        $objectId: String!,
        $userId: String!,
        $workspaceId: String!,
        $version: Int!,
        $name: String!,
        $type: String!,
        $posX: Float!,
        $posY: Float!,
        $posZ: Float!,
        $rotX: Float!,
        $rotY: Float!,
        $rotZ: Float!,
        $scaX: Float!,
        $scaY: Float!,
        $scaZ: Float!,
        $col: String!) {
      reportChanges(
          objectId: $objectId,
          userId: $userId,
          workspaceId: $workspaceId,
          version: $version,
          name: $name,
          type: $type,
          posX: $posX,
          posY: $posY,
          posZ: $posZ,
          rotX: $rotX,
          rotY: $rotY,
          rotZ: $rotZ,
          scaX: $scaX,
          scaY: $scaY,
          scaZ: $scaZ,
          col: $col)
    }`;
    const variables: ReportChangesVars = {
      objectId: obj.uuid,
      userId: userId,
      workspaceId: workspaceId,
      version: version,
      name: obj.name,
      type: obj.geometry.type,
      posX: obj.position.x,
      posY: obj.position.y,
      posZ: obj.position.z,
      rotX: obj.rotation.x,
      rotY: obj.rotation.y,
      rotZ: obj.rotation.z,
      scaX: obj.scale.x,
      scaY: obj.scale.y,
      scaZ: obj.scale.z,
      col: mat.color.getHexString()
    };

    const httpOptions: {headers: HttpHeaders} = {
      headers: new HttpHeaders({
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      })
    };

    return this.http.post<ReportChangesRes>(
        BACK_ROUTES.API,
        JSON.stringify({query, variables}),
        httpOptions);
  }

}
