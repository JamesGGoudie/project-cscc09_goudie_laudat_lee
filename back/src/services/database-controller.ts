import { Client, QueryConfig, QueryResult, QueryResultRow } from 'pg';

import { WorkspaceAndPeerCount } from '../interfaces';
import { randomPeerId } from '../utils';

import { Environment } from './environment';

export class DatabaseController {

  private client = new Client({
    connectionString: Environment.getDatabaseUrl(),
    ssl: Environment.isDatabaseSecure()
  });

  public connectDatabase(): Promise<void> {
    return this.client.connect();
  }

  public async workspaceExists(id: string): Promise<boolean> {
    const query: QueryConfig = {
      text: 'SELECT COUNT(*) FROM workspace WHERE wid = $1',
      values: [id]
    };

    const res: QueryResult<QueryResultRow> = await this.client.query(query);

    return Number.parseInt(res.rows[0].count) > 0;
  }

  public async createWorkspace(id: string, pass: string): Promise<boolean> {
    const query: QueryConfig = {
      text: 'INSERT INTO workspace VALUES($1, $2)',
      values: [id, pass]
    };

    const res: QueryResult<QueryResultRow> = await this.client.query(query);

    return res.rowCount > 0;
  }

  public async addUserToWorkspace(
    workspaceId: string,
    userId: string
  ): Promise<string> {
    let peerId: string;

    while (true) {
      peerId = randomPeerId();

      if (await this.peerIdIsAvailable(peerId)) {
        break;
      }
    }

    const query: QueryConfig = {
      text: 'INSERT INTO workspace_user VALUES($1, $2, $3)',
      values: [workspaceId, userId, peerId]
    };

    const res: QueryResult<QueryResultRow> = await this.client.query(query);

    return res.rowCount > 0 ? peerId : '';
  }

  public async getOtherUsersPeerIds(
    workspaceId: string,
    userId: string
  ): Promise<string[]> {
    const query: QueryConfig = {
      text: 'SELECT peer FROM workspace_user WHERE wid = $1 AND uid <> $2',
      values: [workspaceId, userId]
    };

    const res: QueryResult<QueryResultRow> = await this.client.query(query);

    return res.rows.map((res: QueryResultRow): string => {
      return res.peer;
    });
  }

  public async userExists(
    workspaceId: string,
    userId: string
  ): Promise<boolean> {
    const query: QueryConfig = {
      text: 'SELECT COUNT(*) FROM workspace_user WHERE wid = $1 AND uid = $2',
      values: [workspaceId, userId]
    };

    const res: QueryResult<QueryResultRow> = await this.client.query(query);

    return Number.parseInt(res.rows[0].count) > 0;
  }

  public async passwordMatches(
    workspaceId: string,
    suppliedPass: string
  ): Promise<boolean> {
    const query: QueryConfig = {
      text: 'SELECT password FROM workspace WHERE wid = $1',
      values: [workspaceId]
    };

    const res: QueryResult<QueryResultRow> = await this.client.query(query);

    return res.rows[0].password === suppliedPass;
  }

  public async findWorkspaceAndCountPeers(
    peerId: string
  ): Promise<WorkspaceAndPeerCount> {
    const query: QueryConfig = {
      text: 'SELECT wid, COUNT(*) ' +
          'FROM workspace_user ' +
          'GROUP BY wid ' +
          'HAVING wid = (SELECT wid FROM workspace_user WHERE peer = $1)',
      values: [peerId]
    };

    const res: QueryResult<QueryResultRow> = await this.client.query(query);

    if (res.rows.length === 0) {
      throw 'Could not find workspace of peer ID';
    }

    const data: WorkspaceAndPeerCount = {
      count: res.rows[0].count,
      wid: res.rows[0].wid
    };

    return data;
  }

  public async removePeerId(peerId: string): Promise<boolean> {
    const query: QueryConfig = {
      text: 'DELETE FROM workspace_user WHERE peer = $1',
      values: [peerId]
    };

    const res: QueryResult<QueryResultRow> = await this.client.query(query);

    return res.rowCount > 0;
  }

  public async removeWorkspace(wid: string): Promise<boolean> {
    const query: QueryConfig = {
      text: 'DELETE FROM workspace WHERE wid = $1',
      values: [wid]
    };

    const res: QueryResult<QueryResultRow> = await this.client.query(query);

    return res.rowCount > 0;
  }

  private async peerIdIsAvailable(peerId: string): Promise<boolean> {
    const query: QueryConfig = {
      text: 'SELECT count(*) FROM workspace_user WHERE peer = $1',
      values: [peerId]
    };

    const res: QueryResult<QueryResultRow> = await this.client.query(query);

    if (res.rows.length === 0) {
      throw 'Could not determine if peer is available';
    }

    return Number.parseInt(res.rows[0].count, 10) === 0;
  }

}
