import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import graphqlHTTP from 'express-graphql';

import { GQL_SCHEMA } from './constants';

import {
  CreateWorkspaceReq,
  JoinWorkspaceReq
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
  createWorkspace: (req: CreateWorkspaceReq): boolean => {
    console.log(req);

    if (db.workspaceExists(req.workspaceId)) {
      // Workspace already exists in the database.
      return false;
    }

    if (db.createWorkspace(req.workspaceId, req.workspacePassword)) {
      return db.addUserToWorkspace(req.workspaceId, req.userId);
    } else {
      return false;
    }
  },
  joinWorkspace: (req: JoinWorkspaceReq): string[] => {
    console.log(req);

    if (!db.workspaceExists(req.workspaceId)) {
      // Workspace does not exist in the database.
      return [];
    }

    if (db.userExists(req.workspaceId, req.userId)) {
      // Username already in use.
      return [];
    }

    if (!db.passwordMatches(req.workspaceId, req.workspacePassword)) {
      // Wrong password.
      return [];
    }

    if (db.addUserToWorkspace(req.workspaceId, req.userId)) {
      // Get all peer IDs except for the current user.
      return db.getWorkspacePeerIds(req.workspaceId).filter(
          (peer: string): boolean => {
        return peer.substring(req.workspaceId.length + 1) !== req.userId;
      });
    } else {
      // Failed to add user to database.
      return [];
    }
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
