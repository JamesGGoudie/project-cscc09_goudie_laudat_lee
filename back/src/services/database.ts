import { ObjectInfo, Workspace } from '../interfaces';

export class Database {

  private readonly fakeDatabase: {
    [workspaceId: string]: Workspace
  } = {};

  public workspaceExists(id: string) {
    return !!this.getWorkspace(id);
  }

  public getWorkspace(id: string) {
    return this.fakeDatabase[id];
  }

  public createWorkspace(id: string, pass: string, creator: string) {
    this.fakeDatabase[id] = {
      objects: [],
      password: pass,
      pinnedObjects: [],
      users: [creator]
    };
  }

  public userExists(workspaceId: string, userId: string) {
    return this.getWorkspace(workspaceId).users.includes(userId);
  }

  public passwordMatches(workspacePass: string, suppliedPass: string) {
    return workspacePass === suppliedPass;
  }

  public getObject(workspaceId: string, objectId: string): ObjectInfo {
    return this.getWorkspace(workspaceId).objects.find((obj) => {
      return obj.objectId === objectId;
    });
  }

  public objectExists(workspaceId: string, objectId: string): boolean {
    return !!(this.getWorkspace(workspaceId).objects.find((obj) => {
      return obj.objectId === objectId;
    }));
  }

  public objectIsPinned(workspaceId: string, objectId: string): boolean {
    return this.getWorkspace(workspaceId).pinnedObjects.findIndex((value) => {
      return value.objectId === objectId;
    }) > -1;
  }

  public objectIsPinnedByUser(
    workspaceId: string,
    objectId: string,
    userId: string
  ): boolean {
    const obj = this.getWorkspace(workspaceId).pinnedObjects.find((value) => {
      return value.objectId === objectId;
    });

    if (!obj) {
      // Object does not exist.
      return false;
    }

    return obj.userId === userId;
  }

  public pinObject(workspaceId: string, objectId: string, userId: string) {
    const workspace = this.getWorkspace(workspaceId);

    const prevPinnedIndex = workspace.pinnedObjects.findIndex((obj) => {
      return obj.userId === userId;
    });

    if (prevPinnedIndex > -1) {
      workspace.pinnedObjects.splice(prevPinnedIndex, 1);
    }

    workspace.pinnedObjects.push({objectId: objectId, userId: userId});
  }

  public unpinObject(workspaceId: string, objectId: string) {
    const workspace = this.getWorkspace(workspaceId);

    const prevPinnedIndex = workspace.pinnedObjects.findIndex((obj) => {
      return obj.objectId === objectId;
    });

    if (prevPinnedIndex > -1) {
      workspace.pinnedObjects.splice(prevPinnedIndex, 1);
    }
  }

  public addObjectToWorkspace(workspaceId: string, obj: ObjectInfo) {
    this.getWorkspace(workspaceId).objects.push(obj);
  }

  public updateObjectInWorkspace(workspaceId: string, newObj: ObjectInfo) {
    const workspace = this.getWorkspace(workspaceId);

    const objIndex = workspace.objects.findIndex((oldObj) => {
      return oldObj.objectId === newObj.objectId;
    });

    if (objIndex < 0) {
      return false;
    }

    workspace.objects.splice(objIndex, 1);
    workspace.objects.push(newObj);

    return true;
  }

  public getWorkspaceObjects(workspaceId: string) {
    return this.getWorkspace(workspaceId).objects;
  }

  public getObjectVersion(workspaceId: string, objectId: string) {
    return this.getObject(workspaceId, objectId).version;
  }

  public deleteObject(workspaceId: string, objectId: string) {
    const workspace = this.getWorkspace(workspaceId);

    const objIndex = workspace.objects.findIndex((obj) => {
      return obj.objectId === objectId;
    });

    if (objIndex < 0) {
      return false;
    }

    workspace.objects.splice(objIndex, 1);

    return true;
  }

}
