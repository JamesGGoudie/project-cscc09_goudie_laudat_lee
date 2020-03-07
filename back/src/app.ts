import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import graphqlHTTP from 'express-graphql';
import { buildSchema } from 'graphql';

import { CreateWorkspaceForm, JoinWorkspaceForm } from './interfaces';

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
  }
`);

const root = {
  createWorkspace: (form: CreateWorkspaceForm) => {
    console.log(form);

    return true;
  },
  joinWorkspace: (form: JoinWorkspaceForm) => {
    console.log(form);

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
