import { Injectable } from '@angular/core';

import * as Peer from 'peerjs';
import { Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RtcService {

  private peer: Peer;
  private readonly connections: Peer.DataConnection[] = [];

  public createPeer(id: string): Observable<void> {
    this.peer = new Peer(id);

    const s: Subject<void> = new Subject();

    this.peer.on('open', () => {
      s.next();
    });

    this.peer.on('connection', (conn) => {
      this.setUpConnection(conn);
    });

    return s;
  }

  public connectToPeers(ids: string[]): Observable<void> {
    let i = 0;
    const s: Subject<void> = new Subject();

    for (const id of ids) {
      const conn = this.peer.connect(id);
      this.setUpConnection(conn);

      conn.on('open', () => {
        ++i;

        if (i === ids.length) {
          s.next();
        }
      });
    }

    return s;
  }

  public send(data: any) {
    for(const conn of this.connections) {
      conn.send(data);
    }
  }

  private setUpConnection(conn: Peer.DataConnection) {
    this.connections.push(conn);

    conn.on('data', (data) => {

    });
  }

}
