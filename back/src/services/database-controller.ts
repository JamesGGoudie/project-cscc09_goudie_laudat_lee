import { Client, QueryConfig, QueryResult, QueryResultRow } from 'pg';

import { WorkspaceAndPeerCount } from '../interfaces';
import { randomPeerId } from '../utils';

import { Environment } from './environment';

/**
 * Controls all interaction with the database.
 */
export class DatabaseController {

  private client = new Client({
    connectionString: Environment.getDatabaseUrl(),
    ssl: Environment.isDatabaseSecure()
  });

  /**
   * Connects to the database.
   *
   * Must be done before calling any other methods.
   */
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

    try {
      const res: QueryResult<QueryResultRow> = await this.client.query(query);

      return res.rowCount > 0;
    } catch (e) {
      return false;
    }
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

    return res.rowCount > 0 ? peerId : null;
  }

  /**
   * Returns the peer IDs of all users in the given workspace except for the
   * given user.
   *
   * @param workspaceId
   * @param userId
   */
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

  /**
   * Returns true iff the given user is already in the given workspace.
   *
   * @param workspaceId
   * @param userId
   */
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

  /**
   * Finds the workspace that the given peer ID connects to and counts how many
   * users are currently in that workspace.
   *
   * The given peer ID must currently be in the workspace.
   *
   * @param peerId
   */
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
      throw new Error('Could not find workspace of peer ID');
    }

    const data: WorkspaceAndPeerCount = {
      count: res.rows[0].count,
      wid: res.rows[0].wid
    };

    return data;
  }

  /**
   * Removes the user-workspace pair for the given peer ID.
   *
   * @param peerId
   */
  public async removePeerId(peerId: string): Promise<boolean> {
    const query: QueryConfig = {
      text: 'DELETE FROM workspace_user WHERE peer = $1',
      values: [peerId]
    };

    try {
      const res: QueryResult<QueryResultRow> = await this.client.query(query);

      return res.rowCount > 0;
    } catch (e) {
      return false;
    }
  }

  /**
   * Removes the given workspace from the database.
   *
   * As a consequence, all user-workspace pairs for this workspace should be
   * removed as well.
   *
   * @param wid
   */
  public async removeWorkspace(wid: string): Promise<boolean> {
    const query: QueryConfig = {
      text: 'DELETE FROM workspace WHERE wid = $1',
      values: [wid]
    };

    try {
      const res: QueryResult<QueryResultRow> = await this.client.query(query);

      return res.rowCount > 0;
    } catch (e) {
      return false;
    }
  }

  private async peerIdIsAvailable(peerId: string): Promise<boolean> {
    const query: QueryConfig = {
      text: 'SELECT count(*) FROM workspace_user WHERE peer = $1',
      values: [peerId]
    };

    const res: QueryResult<QueryResultRow> = await this.client.query(query);

    if (res.rows.length === 0) {
      throw new Error('Could not determine if peer is available');
    }

    return Number.parseInt(res.rows[0].count, 10) === 0;
  }

}
