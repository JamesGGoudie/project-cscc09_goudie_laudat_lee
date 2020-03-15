import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import graphqlHTTP from 'express-graphql';

import { GQL_SCHEMA } from './constants';

import {
  CreateWorkspaceReq,
  DeleteObjectReq,
  GetWorkspaceReq,
  JoinWorkspaceReq,
  ObjectInfo,
  PinObjectReq,
  ReportChangesReq,
  UnpinObjectReq
} from './interfaces';

import { Database } from './services';

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use(cors({origin: 'http://localhost:4200'}));

app.use((req, res, next) => {
  console.log('HTTP request', req.method, req.url, req.body);
  next();
});

const db = new Database();

const root = {
  getWorkspace: (req: GetWorkspaceReq): ObjectInfo[] => {
    console.log(req);

    if (!db.workspaceExists(req.workspaceId)) {
      // Workspace does not exist.
      return null;
    }

    return db.getWorkspaceObjects(req.workspaceId);
  },
  createWorkspace: (req: CreateWorkspaceReq) => {
    console.log(req);

    if (db.workspaceExists(req.workspaceId)) {
      // Workspace already exists in the database.
      return false;
    }

    db.createWorkspace(req.workspaceId, req.workspacePassword, req.username);

    return true;
  },
  joinWorkspace: (req: JoinWorkspaceReq) => {
    console.log(req);

    if (!db.workspaceExists(req.workspaceId)) {
      // Workspace does not exist in the database.
      return false;
    }

    const workspace = db.getWorkspace(req.workspaceId);

    if (db.userExists(req.workspaceId, req.username)) {
      // Username already in use.
      return false;
    }

    if (!db.passwordMatches(workspace.password, req.workspacePassword)) {
      // Wrong password.
      return false;
    }

    return true;
  },
  pinObject: (req: PinObjectReq) => {
    console.log(req);

    if (!db.workspaceExists(req.workspaceId)) {
      // Workspace does not exist in the database.
      return false;
    }

    if (db.objectIsPinned(req.workspaceId, req.objectId)) {
      // Object is pinned.
      return false;
    }

    db.pinObject(req.workspaceId, req.objectId, req.userId);

    return true;
  },
  unpinObject: (req: UnpinObjectReq) => {
    console.log(req);

    if (!db.workspaceExists(req.workspaceId)) {
      // Workspace does not exist in the database.
      return false;
    }

    db.unpinObject(req.workspaceId, req.objectId);

    return true;
  },
  reportChanges: (req: ReportChangesReq) => {
    console.log(req);

    if (!db.workspaceExists(req.workspaceId)) {
      // Workspace does not exist in the database.
      return false;
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

    if (!db.objectExists(req.workspaceId, req.objectId)) {
      db.addObjectToWorkspace(req.workspaceId, newObj);
    } else {
      if (!db.objectIsPinnedByUser(req.workspaceId, req.objectId, req.userId)) {
        // User does not own the object.
        return true;
      }

      if (db.getObjectVersion(req.workspaceId, req.objectId) > req.version) {
        return false;
      }

      db.updateObjectInWorkspace(req.workspaceId, newObj);
    }

    return true;
  },
  deleteObject: (req: DeleteObjectReq) => {
    console.log(req);

    if (!db.workspaceExists(req.workspaceId)) {
      // Workspace does not exist in the database.
      return false;
    }

    if (!db.objectExists(req.workspaceId, req.objectId)) {
      return true;
    }

    if (!db.objectIsPinnedByUser(req.workspaceId, req.objectId, req.userId)) {
      // User does not own the object.
      return false;
    }

    db.deleteObject(req.workspaceId, req.objectId);

    return true;
  }
}

const graphQlOptions: graphqlHTTP.Options = {
  graphiql: true,
  rootValue: root,
  schema: GQL_SCHEMA
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
