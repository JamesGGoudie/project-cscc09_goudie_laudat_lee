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
        throw 'Workspace already exists';
      }

      return this.db.createWorkspace(req.workspaceId, req.workspacePassword);
    }).then((created: boolean): Promise<string> => {
      if (!created) {
        throw 'Workspace does not exist, but failed to create workspace';
      }

      return this.db.addUserToWorkspace(req.workspaceId, req.userId);
    }).then((peerId: string): CreateWorkspaceRes => {
      if (!peerId) {
        throw 'Workspace created, but user was not';
      }

      return {
        yourPeerId: peerId
      }
    }).catch((err: string): CreateWorkspaceRes => {
      return {err};
    });
  };

  private readonly joinWorkspace:
      (req: JoinWorkspaceReq)=> Promise<JoinWorkspaceRes> =
      async (req: JoinWorkspaceReq): Promise<JoinWorkspaceRes> => {
    let peerId: string;

    return await this.db.workspaceExists(req.workspaceId).then(
        (workspaceExists: boolean): Promise<boolean> => {
      if (!workspaceExists) {
        throw 'Workspace does not exist';
      }

      return this.db.userExists(req.workspaceId, req.userId);
    }).then((userExists: boolean): Promise<boolean> => {
      if (userExists) {
        throw 'Username is taken';
      }

      return this.db.passwordMatches(req.workspaceId, req.workspacePassword);
    }).then((matches: boolean): Promise<string> => {
      if (!matches) {
        throw 'Wrong password';
      }

      return this.db.addUserToWorkspace(req.workspaceId, req.userId);
    }).then((peer: string): Promise<string[]> => {
      if (!peer) {
        throw 'Workspace exists, password is correct, and user ID is' +
            ' available, but failed to add user to workspace';
      }

      peerId = peer;

      return this.db.getOtherUsersPeerIds(req.workspaceId, req.userId);
    }).then((otherPeers: string[]): JoinWorkspaceRes => {
      if (!otherPeers) {
        throw 'User was added to workspace, but could not get other users';
      }

      return {
        otherPeerIds: otherPeers,
        yourPeerId: peerId
      }
    }).catch((err: string): JoinWorkspaceRes => {
      return {err}
    });
  }

  public constructor(private readonly db: DatabaseController) {}

  public getRoot(): GraphQlRoot {
    return {
      createWorkspace: this.createWorkspace,
      joinWorkspace: this.joinWorkspace
    };
  }

}
