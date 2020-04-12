import { WorkspaceAndPeerCount } from '../interfaces';

import { DatabaseController } from './database-controller';
import { Environment } from './environment';

const { PeerServer } = require('peer');

export class PeerController {

  private readonly ps: any;

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

  private removePeerFromDb(peerId: string): void {
    let count: number;
    let workspaceId: string;

    this.db.findWorkspaceAndCountPeers(peerId).then(
        (data: WorkspaceAndPeerCount): Promise<boolean> => {
      count = data.count;
      workspaceId = data.wid;

      return this.db.removePeerId(peerId);
    }).then((success: boolean): Promise<boolean> => {
      if (!success) {
        throw new Error('Could not remove Peer from DB.');
      }

      if (count <= 1) {
        // The disconnected user was the last user in the workspace.
        // Delete the workspace from the DB.
        return this.db.removeWorkspace(workspaceId);
      }

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
