import { DatabaseController } from './database-controller';

const { PeerServer } = require('peer');

export class PeerController {

  private readonly ps: any;

  public constructor(private readonly db: DatabaseController) {
    this.ps = PeerServer({
        port: 9000,
        path: '/peer',
        key: 'architect',
        proxied: true});

    this.ps.on('connection', (client: any): void => {
      console.log(`Connected to: ${client.id}`);
    });

    this.ps.on('disconnect', (client: any): void => {
      console.log(`Disconnected from: ${client.id}`);
    });

    console.log('Started Peer Server');
  }

}
