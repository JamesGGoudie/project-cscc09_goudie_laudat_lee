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
  createWorkspace: (req: CreateWorkspaceReq): boolean => {
    console.log(req);

    if (db.workspaceExists(req.workspaceId)) {
      // Workspace already exists in the database.
      return false;
    }

    return db.createWorkspace(
        req.workspaceId, req.workspacePassword, req.userId);
  },
  joinWorkspace: (req: JoinWorkspaceReq): boolean => {
    console.log(req);

    if (!db.workspaceExists(req.workspaceId)) {
      // Workspace does not exist in the database.
      return false;
    }

    const workspace = db.getWorkspace(req.workspaceId);

    if (db.userExists(req.workspaceId, req.userId)) {
      // Username already in use.
      return false;
    }

    if (!db.passwordMatches(workspace.password, req.workspacePassword)) {
      // Wrong password.
      return false;
    }

    return true;
  },
  pinObject: (req: PinObjectReq): boolean => {
    console.log(req);

    if (!db.workspaceExists(req.workspaceId)) {
      // Workspace does not exist in the database.
      return false;
    }

    return db.pinObject(req.workspaceId, req.objectId, req.userId);
  },
  unpinObject: (req: UnpinObjectReq): boolean => {
    console.log(req);

    if (!db.workspaceExists(req.workspaceId)) {
      // Workspace does not exist in the database.
      return false;
    }

    return db.unpinObject(req.workspaceId, req.objectId);
  },
  reportChanges: (req: ReportChangesReq): boolean => {
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
      return db.addObjectToWorkspace(req.workspaceId, newObj);
    } else {
      if (!db.objectIsPinnedByUser(
          req.workspaceId, req.objectId, req.userId)) {
        // User does not own the object.
        return false;
      }

      if (db.getObjectVersion(req.workspaceId, req.objectId) >= req.version) {
        // The database has a more up-to-date version.
        // This may have happened due to race conditions.
        // Ignore the request.
        return false;
      }

      return db.updateObjectInWorkspace(req.workspaceId, newObj);
    }
  },
  deleteObject: (req: DeleteObjectReq): boolean => {
    console.log(req);

    if (!db.workspaceExists(req.workspaceId)) {
      // Workspace does not exist in the database.
      return false;
    }

    if (!db.objectExists(req.workspaceId, req.objectId)) {
      // The object does not exist in the database.
      // Technically a success.
      return true;
    }

    if (!db.objectIsPinnedByUser(req.workspaceId, req.objectId, req.userId)) {
      // User does not own the object.
      return false;
    }

    return db.deleteObject(req.workspaceId, req.objectId);
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
