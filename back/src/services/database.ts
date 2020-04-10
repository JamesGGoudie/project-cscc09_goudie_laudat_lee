import { ObjectInfo, PinnedInfo, Workspace, User } from '../interfaces';

export class Database {

  private readonly fakeDatabase: {
    [workspaceId: string]: Workspace
  } = {};

  private readonly userDatabase: {
    [username: string]: User
  } = {};

  public workspaceExists(id: string): boolean {
    return !!this.getWorkspace(id);
  }

  public getWorkspace(id: string): Workspace {
    return this.fakeDatabase[id];
  }

  public createWorkspace(id: string, pass: string, creator: string): boolean {
    this.fakeDatabase[id] = {
      objects: [],
      password: pass,
      pinnedObjects: [],
      users: [creator]
    };

    return true;
  }

  public getUser(username: string): User {
    return this.userDatabase[username];
  }

  public createUser(emailAddress: string, username: string, password: string): boolean {
    this.userDatabase[username] = {
      emailAddress: emailAddress,
      username: username,
      password: password,
      status: 0
    };

    return true;
  }

  public usernameExists(username: string): boolean{
    if(this.userDatabase.hasOwnProperty(username)){
      return true;
    } else {
      return false;
    }
  }

  public userExists(workspaceId: string, userId: string): boolean {
    return this.getWorkspace(workspaceId).users.includes(userId);
  }

  public passwordMatches(
    workspacePass: string, suppliedPass: string
  ): boolean {
    return workspacePass === suppliedPass;
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
