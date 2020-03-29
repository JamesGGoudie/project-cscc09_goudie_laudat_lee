import bodyParser from 'body-parser';
import cors from 'cors';
import express from 'express';
import graphqlHTTP from 'express-graphql';

import { GQL_SCHEMA } from './constants';

import {
  DatabaseController,
  Environment,
  GraphQlFactory,
  PeerController
} from './services';

const db: DatabaseController = new DatabaseController();

db.connectDatabase().then(() => {
  const app: express.Express = express();

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({extended: false}));

  app.use(cors({origin: Environment.getOrigin()}));

  app.use((req, res, next) => {
    console.log('HTTP request', req.method, req.url, req.body);
    next();
  });

  const peerController: PeerController = new PeerController(db);
  const factory: GraphQlFactory = new GraphQlFactory(db);

  const graphQlOptions: graphqlHTTP.Options = {
    graphiql: true,
    rootValue: factory.getRoot(),
    schema: GQL_SCHEMA
  }

  app.use(Environment.getGraphQlPath(), graphqlHTTP(graphQlOptions));

  const port = Environment.getGraphQlPort();

  app.listen(port, (err) => {
    if (err) {
      console.log(err);
    } else {
      console.log(`HTTP server on http://localhost:${port}`);
    }
  });
}).catch((err) => {
  console.error(err);
});
