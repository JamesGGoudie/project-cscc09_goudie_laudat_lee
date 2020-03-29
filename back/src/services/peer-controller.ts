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
    });

    console.log('Started Peer Server');
  }

}
