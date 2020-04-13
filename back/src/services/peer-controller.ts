import { WorkspaceAndPeerCount } from '../interfaces';

import { DatabaseController } from './database-controller';
import { Environment } from './environment';

const { PeerServer } = require('peer');

export class PeerController {

  private readonly ps: any;

  /**
   * Handles all of the activity with the PeerJS server.
   *
   * It starts the server and handles events when users connect and disconnect
   * from the server.
   *
   * @param db A reference to the database controller.
   */
  public constructor(private readonly db: DatabaseController) {
    this.ps = PeerServer({
        port: Environment.getPeerPort(),
        path: Environment.getPeerPath(),
        key: Environment.getPeerKey(),
        proxied: Environment.isPeerProxied()});

    this.ps.on('connection', (client: any): void => {
      console.log(`Connected to: ${client.id}`);
    });

    this.ps.on('disconnect', (client: any): void => {
      console.log(`Disconnected from: ${client.id}`);
      this.removePeerFromDb(client.id);
    });

    console.log('Started Peer Server');
  }

  /**
   * Removes the given peer ID from the database.
   *
   * If the given peer ID is the last one for a workspace, then the workspace
   * will be removed as well.
   *
   * @param peerId
   */
  private removePeerFromDb(peerId: string): void {
    let usersCount: number;
    let workspaceId: string;

    this.db.findWorkspaceAndCountPeers(peerId).then(
        (data: WorkspaceAndPeerCount): Promise<boolean> => {
      // We need to find the workspace before removing the peer because once
      // the peer is removed, then we can't find the workspace.
      usersCount = data.count;
      workspaceId = data.wid;

      return this.db.removePeerId(peerId);
    }).then((success: boolean): Promise<boolean> => {
      if (!success) {
        throw new Error('Could not remove Peer from DB.');
      }

      if (usersCount <= 1) {
        // The disconnected user was the last user in the workspace.
        // Delete the workspace from the DB.
        return this.db.removeWorkspace(workspaceId);
      }

      // There are still users in the workspace.
      // Return an arbitrary promise that will always return true to satisfy
      // the next check.

      return new Promise((
        res: (value?: boolean | PromiseLike<boolean>) => void,
        rej: (reason?: any) => void
      ): void => {
        res(true);
      });
    }).then((success: boolean): void => {
      if (!success) {
        throw new Error('Could not remove workspace from DB.');
      }
    }).catch((err: Error): void => {
      console.error(err);
    });
  }

}
