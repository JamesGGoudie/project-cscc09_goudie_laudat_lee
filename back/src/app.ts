import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import graphqlHTTP from 'express-graphql';
import { buildSchema } from 'graphql';

import {
  CreateWorkspaceReq,
  DeleteObjectReq,
  GetWorkspaceReq,
  JoinWorkspaceReq,
  ObjectInfo,
  PinObjectReq,
  ReportChangesReq,
  UnpinObjectReq,
  Workspace
} from './interfaces';

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use(cors({origin: 'http://localhost:4200'}));

// app.use(express.static('dist/front'));

app.use((req, res, next) => {
  console.log('HTTP request', req.method, req.url, req.body);
  next();
});

const gqlSchema = buildSchema(`
  type ObjectInfo {
    objectId: String!,
    version: Int!,
    name: String!,
    geometryType: String!
    position: [Float!]!,
    rotation: [Float!]!
    scale: [Float!]!,
    materialColorHex: String!,
  }

  type Query {
    getWorkspace(
      workspaceId: String!
    ): [ObjectInfo]
    createWorkspace(
      workspaceId: String!,
      workspacePassword: String!,
      username: String!
    ): String
    joinWorkspace(
      workspaceId: String!,
      workspacePassword: String!,
      username: String!
    ): String
    pinObject(
      objectId: String!,
      userId: String!,
      workspaceId: String!
    ): String
    unpinObject(
      objectId: String!,
      userId: String!,
      workspaceId: String!
    ): String
  }

  type Mutation {
    reportChanges(
      objectId: String!,
      userId: String!,
      workspaceId: String!,
      version: Int!,
      name: String!,
      type: String!,
      posX: Float!,
      posY: Float!,
      posZ: Float!,
      rotX: Float!,
      rotY: Float!,
      rotZ: Float!,
      scaX: Float!,
      scaY: Float!,
      scaZ: Float!,
      col: String!
    ): String
    deleteObject(
      objectId: String!,
      userId: String!,
      workspaceId: String!
    ): String
  }
`);

const fakeDatabase: {
  [workspaceId: string]: Workspace
} = {};

function workspaceExists(id: string) {
  return !!getWorkspace(id);
}

function getWorkspace(id: string) {
  return fakeDatabase[id];
}

function createWorkspace(id: string, pass: string, creator: string) {
  fakeDatabase[id] = {
    objects: [],
    password: pass,
    pinnedObjects: [],
    users: [creator]
  };
}

function userExists(workspaceId: string, userId: string) {
  return getWorkspace(workspaceId).users.includes(userId);
}

function passwordMatches(workspacePass: string, suppliedPass: string) {
  return workspacePass === suppliedPass;
}

function getObject(workspaceId: string, objectId: string): ObjectInfo {
  return getWorkspace(workspaceId).objects.find((obj) => {
    return obj.objectId === objectId;
  });
}

function objectExists(workspaceId: string, objectId: string): boolean {
  return !!(getWorkspace(workspaceId).objects.find((obj) => {
    return obj.objectId === objectId;
  }));
}

function objectIsPinned(workspaceId: string, objectId: string): boolean {
  return getWorkspace(workspaceId).pinnedObjects.findIndex((value) => {
    return value.objectId === objectId;
  }) > -1;
}

function objectIsPinnedByUser(
  workspaceId: string,
  objectId: string,
  userId: string
): boolean {
  const obj = getWorkspace(workspaceId).pinnedObjects.find((value) => {
    return value.objectId === objectId;
  });

  if (!obj) {
    // Object does not exist.
    return false;
  }

  return obj.userId === userId;
}

function pinObject(workspaceId: string, objectId: string, userId: string) {
  const workspace = getWorkspace(workspaceId);

  const prevPinnedIndex = workspace.pinnedObjects.findIndex((value) => {
    return value.userId === userId;
  });

  if (prevPinnedIndex > -1) {
    workspace.pinnedObjects.splice(prevPinnedIndex, 1);
  }

  workspace.pinnedObjects.push({objectId: objectId, userId: userId});
}

function unpinObject(workspaceId: string, objectId: string) {
  const workspace = getWorkspace(workspaceId);

  const prevPinnedIndex = workspace.pinnedObjects.findIndex((value) => {
    value.objectId === objectId;
  });

  if (prevPinnedIndex > -1) {
    workspace.pinnedObjects.splice(prevPinnedIndex, 1);
  }
}

function addObjectToWorkspace(workspaceId: string, obj: ObjectInfo) {
  getWorkspace(workspaceId).objects.push(obj);
}

function updateObjectInWorkspace(workspaceId: string, newObj: ObjectInfo) {
  const workspace = getWorkspace(workspaceId);

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

function getWorkspaceObjects(workspaceId: string) {
  return getWorkspace(workspaceId).objects;
}

function getObjectVersion(workspaceId: string, objectId: string) {
  return getObject(workspaceId, objectId).version;
}

function deleteObject(workspaceId: string, objectId: string) {
  const workspace = getWorkspace(workspaceId);

  const objIndex = workspace.objects.findIndex((obj) => {
    return obj.objectId === objectId;
  });

  if (objIndex < 0) {
    return false;
  }

  workspace.objects.splice(objIndex, 1);

  return true;
}

const root = {
  getWorkspace: (req: GetWorkspaceReq): ObjectInfo[] => {
    console.log(req);

    if (!workspaceExists(req.workspaceId)) {
      // Workspace does not exist.
      return null;
    }

    return getWorkspaceObjects(req.workspaceId);
  },
  createWorkspace: (req: CreateWorkspaceReq) => {
    console.log(req);

    if (workspaceExists(req.workspaceId)) {
      // Workspace already exists in the database.
      return 'Workspace already exists';
    }

    createWorkspace(req.workspaceId, req.workspacePassword, req.username);

    return 'Success';
  },
  joinWorkspace: (req: JoinWorkspaceReq) => {
    console.log(req);

    if (!workspaceExists(req.workspaceId)) {
      // Workspace does not exist in the database.
      return 'Workspace does not exist';
    }

    const workspace = getWorkspace(req.workspaceId);

    if (userExists(req.workspaceId, req.username)) {
      // Username already in use.
      return 'UserId in use';
    }

    if (!passwordMatches(workspace.password, req.workspacePassword)) {
      // Wrong password.
      return 'Bad pass';
    }

    return 'Success';
  },
  pinObject: (req: PinObjectReq) => {
    console.log(req);

    if (!workspaceExists(req.workspaceId)) {
      // Workspace does not exist in the database.
      return 'Workspace does not exist';
    }

    if (objectIsPinned(req.workspaceId, req.objectId)) {
      // Object is pinned.
      return 'Object in use';
    }

    pinObject(req.workspaceId, req.objectId, req.userId);

    return 'Object pinned';
  },
  unpinObject: (req: UnpinObjectReq) => {
    console.log(req);

    if (!workspaceExists(req.workspaceId)) {
      // Workspace does not exist in the database.
      return 'Workspace does not exist';
    }

    unpinObject(req.workspaceId, req.objectId);

    return 'Unpinned object';
  },
  reportChanges: (req: ReportChangesReq) => {
    console.log(req);

    if (!workspaceExists(req.workspaceId)) {
      // Workspace does not exist in the database.
      return 'Workspace does not exist';
    }

    const newObj: ObjectInfo = {
      objectId: req.objectId,

      version: req.version,

      name: req.name,
      geometryType: req.type,

      position: [req.posX, req.posY, req.posZ],
      rotation: [req.rotX, req.rotY, req.rotZ],
      scale: [req.scaX, req.scaY, req.scaZ],

      materialColorHex: req.col
    };

    if (!objectExists(req.workspaceId, req.objectId)) {
      addObjectToWorkspace(req.workspaceId, newObj);
    } else {
      if (!objectIsPinnedByUser(req.workspaceId, req.objectId, req.userId)) {
        // User does not own the object.
        return 'Not owned';
      }

      if (getObjectVersion(req.workspaceId, req.objectId) > req.version) {
        return 'Bad Version';
      }

      updateObjectInWorkspace(req.workspaceId, newObj);
    }

    return 'All good';
  },
  deleteObject: (req: DeleteObjectReq) => {
    console.log(req);

    if (!workspaceExists(req.workspaceId)) {
      // Workspace does not exist in the database.
      return 'Workspace does not exist';
    }

    if (!objectExists(req.workspaceId, req.objectId)) {
      return 'Object does not exist';
    }

    if (!objectIsPinnedByUser(req.workspaceId, req.objectId, req.userId)) {
      // User does not own the object.
      return 'Not owned';
    }

    deleteObject(req.workspaceId, req.objectId);

    return 'All Good';
  }
}

const graphQlOptions: graphqlHTTP.Options = {
  graphiql: true,
  rootValue: root,
  schema: gqlSchema
}

app.use('/graphql', graphqlHTTP(graphQlOptions));

const PORT = 3000;

app.listen(PORT, (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log('HTTP server on http://localhost:%s', PORT);
  }
});
