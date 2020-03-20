import { Workspace } from '../interfaces';
import { randomPeerId } from '../utils';

export class Database {

  private readonly fakeDatabase: {
    [workspaceId: string]: Workspace
  } = {};

  public workspaceExists(id: string): boolean {
    return !!this.getWorkspace(id);
  }

  public getWorkspace(id: string): Workspace {
    return this.fakeDatabase[id];
  }

  public createWorkspace(id: string, pass: string): boolean {
    this.fakeDatabase[id] = {
      name: id,
      password: pass,
      peerIds: [],
      users: []
    };

    return true;
  }

  public addUserToWorkspace(workspaceId: string, userId: string): boolean {
    this.fakeDatabase[workspaceId].users.push(userId);

    return true;
  }

  public createPeerInWorkspace(workspaceId: string): string {
    const peerId = randomPeerId();

    this.fakeDatabase[workspaceId].peerIds.push(peerId);

    return peerId;
  }

  public getWorkspacePeerIds(workspaceId: string): string[] {
    return this.fakeDatabase[workspaceId].peerIds;
  }

  public userExists(workspaceId: string, userId: string): boolean {
    return this.getWorkspace(workspaceId).users.includes(userId);
  }

  public passwordMatches(
    workspaceId: string, suppliedPass: string
  ): boolean {
    return this.fakeDatabase[workspaceId].password === suppliedPass;
  }

}
