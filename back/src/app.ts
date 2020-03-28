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

// const FRONT = 'http://localhost:4200';
const FRONT = 'https://www.architect3d.com:443';

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use(cors({origin: FRONT}));

app.use((req, res, next) => {
  console.log('HTTP request', req.method, req.url, req.body);
  next();
});

const db = new Database();

db.connectDatabase().then(() => {
  const root = {
    createWorkspace: async (
      req: CreateWorkspaceReq
    ): Promise<CreateWorkspaceRes> => {
      return await db.workspaceExists(req.workspaceId).then(
          (workspaceExists: boolean): Promise<boolean> => {
        if (workspaceExists) {
          throw 'Workspace already exists';
        }

        return db.createWorkspace(req.workspaceId, req.workspacePassword);
      }).then((created: boolean): Promise<string> => {
        if (!created) {
          throw 'Workspace does not exist, but failed to create workspace';
        }

        return db.addUserToWorkspace(req.workspaceId, req.userId);
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
    },
    joinWorkspace: async (
      req: JoinWorkspaceReq
    ): Promise<JoinWorkspaceRes> => {
      let peerId: string;

      return await db.workspaceExists(req.workspaceId).then(
          (workspaceExists: boolean): Promise<boolean> => {
        if (!workspaceExists) {
          throw 'Workspace does not exist';
        }

        return db.userExists(req.workspaceId, req.userId);
      }).then((userExists: boolean): Promise<boolean> => {
        if (userExists) {
          throw 'Username is taken';
        }

        return db.passwordMatches(req.workspaceId, req.workspacePassword);
      }).then((matches: boolean): Promise<string> => {
        if (!matches) {
          throw 'Wrong password';
        }

        return db.addUserToWorkspace(req.workspaceId, req.userId);
      }).then((peer: string): Promise<string[]> => {
        if (!peer) {
          throw 'Workspace exists, password is correct, and user ID is' +
              ' available, but failed to add user to workspace';
        }

        peerId = peer;

        return db.getOtherUsersPeerIds(req.workspaceId, req.userId);
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
      console.log('Hello boys, I\'m baaaaaaaaaaaaaaaaaaaaack!!!!!!!!');
    }
  });
}).catch((err) => {
  console.error(err);
});
