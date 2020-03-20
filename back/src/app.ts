import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import graphqlHTTP from 'express-graphql';

import { GQL_SCHEMA } from './constants';

import {
  CreateWorkspaceReq,
  CreateWorkspaceRes,
  JoinWorkspaceReq,
  JoinWorkspaceRes
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
  createWorkspace: (req: CreateWorkspaceReq): CreateWorkspaceRes => {
    console.log(req);

    if (db.workspaceExists(req.workspaceId)) {
      return {
        err: 'Workspace already exists'
      };
    }

    if (db.createWorkspace(req.workspaceId, req.workspacePassword)) {
      if (db.addUserToWorkspace(req.workspaceId, req.userId)) {
        return {
          success: true
        }
      } else {
        return {
          err: 'Workspace was created, but failed to add user to database'
        }
      }
    } else {
      return {
          err: 'Workspace does not exist, but cound not be created'
      };
    }
  },
  joinWorkspace: (req: JoinWorkspaceReq): JoinWorkspaceRes => {
    console.log(req);

    if (!db.workspaceExists(req.workspaceId)) {
      return {
        err: 'Workspace does not exist'
      };
    }

    if (db.userExists(req.workspaceId, req.userId)) {
      return {
        err: 'Username is taken'
      };
    }

    if (!db.passwordMatches(req.workspaceId, req.workspacePassword)) {
      return {
        err: 'Wrong password'
      };
    }

    if (db.addUserToWorkspace(req.workspaceId, req.userId)) {
      // Get all peer IDs except for the current user.
      return {
        peers: db.getWorkspacePeerIds(req.workspaceId).filter(
            (peer: string): boolean => {
          return peer.substring(req.workspaceId.length + 1) !== req.userId;
        })
      };
    } else {
      return {
        err: 'Workspace exists, password is correct, and user ID is' +
            ' available, but failed to add user to workspace'
      };
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
