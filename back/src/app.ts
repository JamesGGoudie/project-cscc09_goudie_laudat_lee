import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import graphqlHTTP from 'express-graphql';
import { buildSchema } from 'graphql';

import {
  CreateWorkspaceForm,
  JoinWorkspaceForm,
  PinObjectForm,
  UnpinObjectForm,
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
  type Query {
    createWorkspace(
        workspaceId: String!,
        workspacePassword: String!,
        username: String!): Boolean
    joinWorkspace(
        workspaceId: String!,
        workspacePassword: String!,
        username: String!): Boolean
    pinObject(
        objectId: String!,
        userId: String!,
        workspaceId: String!,): Boolean
    unpinObject(
        objectId: String!,
        userId: String!,
        workspaceId: String!,): Boolean
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

function objectIsPinned(workspace: Workspace, objectId: string): boolean {
  return workspace.pinnedObjects.findIndex((value) => {
    return value.objectId === objectId;
  }) > -1;
}

function pinObject(workspace: Workspace, objectId: string, userId: string) {
  const prevPinnedIndex = workspace.pinnedObjects.findIndex((value) => {
    return value.userId === userId;
  });

  if (prevPinnedIndex > -1) {
    workspace.pinnedObjects.splice(prevPinnedIndex, 1);
  }

  workspace.pinnedObjects.push({objectId: objectId, userId: userId});
}

function unpinObject(workspace: Workspace, objectId: string) {
  const prevPinnedIndex = workspace.pinnedObjects.findIndex((value) => {
    value.objectId === objectId;
  });

  if (prevPinnedIndex > -1) {
    workspace.pinnedObjects.splice(prevPinnedIndex, 1);
  }
}

const root = {
  createWorkspace: (form: CreateWorkspaceForm) => {
    console.log(form);

    if (workspaceExists(form.workspaceId)) {
      // Workspace already exists in the database.
      return false;
    }

    createWorkspace(form.workspaceId, form.workspacePassword, form.username);

    return true;
  },
  joinWorkspace: (form: JoinWorkspaceForm) => {
    console.log(form);

    if (!workspaceExists(form.workspaceId)) {
      // Workspace does not exist in the database.
      return false;
    }

    const workspace = getWorkspace(form.workspaceId);

    if (userExists(form.workspaceId, form.username)) {
      // Username already in use.
      return false;
    }

    if (!passwordMatches(workspace.password, form.workspacePassword)) {
      // Wrong password.
      return false;
    }

    return true;
  },
  pinObject: (form: PinObjectForm) => {
    console.log(form);

    if (!workspaceExists(form.workspaceId)) {
      // Workspace does not exist in the database.
      return false;
    }

    const workspace = getWorkspace(form.workspaceId);

    if (objectIsPinned(workspace, form.objectId)) {
      // Object is pinned.
      return false;
    }

    pinObject(workspace, form.objectId, form.userId);

    return true;
  },
  unpinObject: (form: UnpinObjectForm) => {
    console.log(form);

    if (!workspaceExists(form.workspaceId)) {
      // Workspace does not exist in the database.
      return false;
    }

    const workspace = getWorkspace(form.workspaceId);

    unpinObject(workspace, form.objectId);

    return true;
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
