import { Client, QueryConfig, QueryResult, QueryResultRow } from 'pg';

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
    const peerId: string = randomPeerId();

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

}
