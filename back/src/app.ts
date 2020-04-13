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

db.connectDatabase().then((): void => {
  const app: express.Express = express();

  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({extended: false}));

  // Enable CORS.
  app.use(cors({origin: Environment.getOrigin()}));

  if (Environment.isDebuggingEnabled()) {
    app.use((req, res, next) => {
      console.log('HTTP request', req.method, req.url, req.body);
      next();
    });
  } else {
    app.use((req, res, next) => {
      console.log('HTTP request', req.method, req.url);
      next();
    });
  }

  /**
   * A reference to the controller for the Peer JS server.
   *
   * The value is never read, but I don't know how JS garbage collection works
   * and so will leave it as it is, IDE warnings be damned.
   */
  const peerController: PeerController = new PeerController(db);
  const factory: GraphQlFactory = new GraphQlFactory(db);

  const graphQlOptions: graphqlHTTP.Options = {
    graphiql: Environment.isGraphIQlEnabled(),
    rootValue: factory.buildRoot(),
    schema: GQL_SCHEMA
  }

  app.use(Environment.getGraphQlPath(), graphqlHTTP(graphQlOptions));

  app.get(
      '/.well-known/acme-challenge/XQpuZJ9faBfbkBDDMabj0VugWq2qCkyKCwGzG-v4_og',
      (req, res, next) => {
    res.send('XQpuZJ9faBfbkBDDMabj0VugWq2qCkyKCwGzG-v4_og.vm072PJs_xRHA3hYKODvmlIcdN3Af7H0LQegd8mx6qw');
  });

  const port = Environment.getGraphQlPort();

  app.listen(port, (err: any): void => {
    if (err) {
      console.error(err);
    } else {
      console.log(`GraphQL server on http://localhost:${port}`);
    }
  });
}).catch((err: any): void => {
  console.error(err);
});
