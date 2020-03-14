import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import graphqlHTTP from 'express-graphql';
import { buildSchema } from 'graphql';

import {
  CreateWorkspaceForm,
  JoinWorkspaceForm,
  PinObjectForm
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
        workspaceId: String!,
        objectId: String!): Boolean
  }
`);

const fakeDatabase: {
  [workspaceId: string]: {
    password: string,
    pinnedObjects: string[],
    users: string[]
  }
} = {};

const root = {
  createWorkspace: (form: CreateWorkspaceForm) => {
    console.log(form);

    if (fakeDatabase[form.workspaceId]) {
      // Workspace already exists in the database.
      return false;
    }

    fakeDatabase[form.workspaceId] = {
      password: form.workspacePassword,
      pinnedObjects: [],
      users: [form.username]
    };

    return true;
  },
  joinWorkspace: (form: JoinWorkspaceForm) => {
    console.log(form);

    if (!fakeDatabase[form.workspaceId]) {
      // Workspace does not exist in the database.
      return false;
    }

    if (fakeDatabase[form.workspaceId].users.includes(form.username)) {
      // Username already in use.
      return false;
    }

    if (fakeDatabase[form.workspaceId].password !== form.workspacePassword) {
      // Wrong password.
      return false;
    }

    return true;
  },
  pinObject: (form: PinObjectForm) => {
    console.log(form);

    if (!fakeDatabase[form.workspaceId]) {
      // Workspace does not exist in the database.
      return false;
    }

    if (fakeDatabase[form.workspaceId].pinnedObjects.includes(form.objectId)) {
      // Object is pinned.
      return false;
    }

    fakeDatabase[form.workspaceId].pinnedObjects.push(form.objectId);

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
