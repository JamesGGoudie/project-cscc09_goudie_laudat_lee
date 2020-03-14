import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

import { BACK_ROUTES } from 'src/app/constants';
import { PinObjectResponse } from 'src/app/interfaces';

@Injectable({
  providedIn: 'root'
})
export class WorkspaceSyncService {

  public constructor(private http: HttpClient) {}

  public pinObject(
    workspaceId: string, objectId: string
  ): Observable<PinObjectResponse> {
    const query = `query Pin($workspaceId: String!, $objectId: String!) {
      pinObject(workspaceId: $workspaceId, objectId: $objectId)
    }`;
    const variables = {
      objectId,
      workspaceId
    }

    const httpOptions: {headers: HttpHeaders} = {
      headers: new HttpHeaders({
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      })
    };

    return this.http.post<PinObjectResponse>(
        BACK_ROUTES.API,
        JSON.stringify({query, variables}),
        httpOptions);
  }

}
