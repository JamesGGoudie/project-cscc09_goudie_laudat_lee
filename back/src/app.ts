import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import graphqlHTTP from 'express-graphql';

import { GQL_SCHEMA } from './constants';

import {
  DatabaseController,
  GraphQlFactory,
  PeerController
} from './services';

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

const db: DatabaseController = new DatabaseController();

db.connectDatabase().then(() => {
  const peerController: PeerController = new PeerController(db);
  const factory: GraphQlFactory = new GraphQlFactory(db);

  const graphQlOptions: graphqlHTTP.Options = {
    graphiql: true,
    rootValue: factory.getRoot(),
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
