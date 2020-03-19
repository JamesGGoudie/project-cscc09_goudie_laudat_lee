import { ObjectInfo, PinnedInfo, Workspace } from '../interfaces';

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
      objects: [],
      password: pass,
      peerIds: [],
      pinnedObjects: [],
      users: []
    };

    return true;
  }

  public addUserToWorkspace(workspaceId: string, userId: string): boolean {
    this.fakeDatabase[workspaceId].users.push(userId);
    this.fakeDatabase[workspaceId].peerIds.push(`${workspaceId}-${userId}`);

    return true;
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

  public getObject(workspaceId: string, objectId: string): ObjectInfo {
    return this.getWorkspace(workspaceId).objects.find(
        (obj: ObjectInfo): boolean => {
      return obj.objectId === objectId;
    });
  }

  public objectExists(workspaceId: string, objectId: string): boolean {
    return !!(this.getWorkspace(workspaceId).objects.find(
        (obj: ObjectInfo): boolean => {
      return obj.objectId === objectId;
    }));
  }

  public objectIsPinned(workspaceId: string, objectId: string): boolean {
    return this.getWorkspace(workspaceId).pinnedObjects.findIndex(
        (pinnedData: PinnedInfo): boolean => {
      return pinnedData.objectId === objectId;
    }) > -1;
  }

  public objectIsPinnedByUser(
    workspaceId: string,
    objectId: string,
    userId: string
  ): boolean {
    const obj = this.getWorkspace(workspaceId).pinnedObjects.find(
        (pinnedData: PinnedInfo): boolean => {
      return pinnedData.objectId === objectId;
    });

    if (!obj) {
      // Object does not exist.
      return false;
    }

    return obj.userId === userId;
  }

  public pinObject(
    workspaceId: string, objectId: string, userId: string
  ): boolean {
    const workspace = this.getWorkspace(workspaceId);

    const prevPinnedInfo = workspace.pinnedObjects.find(
        (obj: PinnedInfo): boolean => {
      return obj.objectId === objectId;
    });

    if (prevPinnedInfo) {
      // If the object is pinned by another user...
      if (prevPinnedInfo.userId !== userId) {
        return false;
      }

      // The user has already pinned the object.
      // Technically a success.
      return true;
    }

    workspace.pinnedObjects.push({objectId: objectId, userId: userId});

    return true;
  }

  public unpinObject(workspaceId: string, objectId: string): boolean {
    const workspace = this.getWorkspace(workspaceId);

    const prevPinnedIndex = workspace.pinnedObjects.findIndex(
        (obj: PinnedInfo): boolean => {
      return obj.objectId === objectId;
    });

    if (prevPinnedIndex === -1) {
      // The object is already unpinned.
      // Technically a success.
      return true;
    }

    workspace.pinnedObjects.splice(prevPinnedIndex, 1);

    return true;
  }

  public addObjectToWorkspace(
    workspaceId: string, obj: ObjectInfo
  ): boolean {
    this.getWorkspace(workspaceId).objects.push(obj);

    return true;
  }

  public updateObjectInWorkspace(
    workspaceId: string, newObj: ObjectInfo
  ): boolean {
    const workspace = this.getWorkspace(workspaceId);

    const objIndex = workspace.objects.findIndex(
        (oldObj: ObjectInfo): boolean => {
      return oldObj.objectId === newObj.objectId;
    });

    if (objIndex < 0) {
      // The object does not exist in the workspace.
      return false;
    }

    workspace.objects.splice(objIndex, 1);
    workspace.objects.push(newObj);

    return true;
  }

  public getWorkspaceObjects(workspaceId: string): ObjectInfo[] {
    return this.getWorkspace(workspaceId).objects;
  }

  public getObjectVersion(workspaceId: string, objectId: string) : number{
    return this.getObject(workspaceId, objectId).version;
  }

  public deleteObject(workspaceId: string, objectId: string): boolean {
    const workspace = this.getWorkspace(workspaceId);

    const objIndex = workspace.objects.findIndex(
        (obj: ObjectInfo): boolean => {
      return obj.objectId === objectId;
    });

    if (objIndex < 0) {
      // The object does not exist in the workspace.
      // Technically a success.
      return true;
    }

    workspace.objects.splice(objIndex, 1);

    return true;
  }

}
