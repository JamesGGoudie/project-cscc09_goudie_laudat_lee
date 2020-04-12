import {
  CreateWorkspaceReq,
  CreateWorkspaceRes,
  GraphQlRoot,
  JoinWorkspaceReq,
  JoinWorkspaceRes
} from '../interfaces';

import { DatabaseController } from './database-controller';

export class GraphQlFactory {

  private readonly createWorkspace:
      (req: CreateWorkspaceReq)=> Promise<CreateWorkspaceRes> =
      async (req: CreateWorkspaceReq): Promise<CreateWorkspaceRes> => {
    return await this.db.workspaceExists(req.workspaceId).then(
        (workspaceExists: boolean): Promise<boolean> => {
      if (workspaceExists) {
        throw new Error('Workspace already exists');
      }

      return this.db.createWorkspace(req.workspaceId, req.workspacePassword);
    }).then((created: boolean): Promise<string> => {
      if (!created) {
        throw new Error('Workspace does not exist, but failed to create ' +
            ' workspace');
      }

      return this.db.addUserToWorkspace(req.workspaceId, req.userId);
    }).then((peerId: string): CreateWorkspaceRes => {
      if (!peerId) {
        throw new Error('Workspace created, but user was not');
      }

      return {
        yourPeerId: peerId
      }
    });
  };

  private readonly joinWorkspace:
      (req: JoinWorkspaceReq)=> Promise<JoinWorkspaceRes> =
      async (req: JoinWorkspaceReq): Promise<JoinWorkspaceRes> => {
    let peerId: string;

    return await this.db.workspaceExists(req.workspaceId).then(
        (workspaceExists: boolean): Promise<boolean> => {
      if (!workspaceExists) {
        throw new Error('Workspace does not exist');
      }

      return this.db.userExists(req.workspaceId, req.userId);
    }).then((userExists: boolean): Promise<boolean> => {
      if (userExists) {
        throw new Error('Username is taken');
      }

      return this.db.passwordMatches(req.workspaceId, req.workspacePassword);
    }).then((matches: boolean): Promise<string> => {
      if (!matches) {
        throw new Error('Wrong password');
      }

      return this.db.addUserToWorkspace(req.workspaceId, req.userId);
    }).then((peer: string): Promise<string[]> => {
      if (!peer) {
        throw new Error('Workspace exists, password is correct, and user ID' +
            ' is available, but failed to add user to workspace');
      }

      peerId = peer;

      return this.db.getOtherUsersPeerIds(req.workspaceId, req.userId);
    }).then((otherPeers: string[]): JoinWorkspaceRes => {
      if (!otherPeers) {
        throw new Error('User was added to workspace, but could not get ' +
            'other users');
      }

      return {
        otherPeerIds: otherPeers,
        yourPeerId: peerId
      }
    });
  }

  /**
   * Fascade for all of the GraphQL logic.
   *
   * @param db A reference to the database controller.
   */
  public constructor(private readonly db: DatabaseController) {}

  /**
   * Gets the root of the GraphQL interface.
   */
  public buildRoot(): GraphQlRoot {
    return {
      createWorkspace: this.createWorkspace,
      joinWorkspace: this.joinWorkspace
    };
  }

}
