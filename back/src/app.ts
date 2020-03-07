import bodyParser from 'body-parser';
import express from 'express';
import graphqlHTTP from 'express-graphql';
import { buildSchema } from 'graphql';

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.use(express.static('dist/front'));

app.use((req, res, next) => {
  console.log('HTTP request', req.method, req.url, req.body);
  next();
});

const gqlSchema = buildSchema(`
  type Query {
    favColour(user: String): String
  }
`);

const root = {
  favColour: (data: {user: string}) => {
    switch (data.user) {
      case 'James': {
        return 'Orange'
      }
      default: {
        return 'Blue'
      }
    }
  }
}

const graphQlOptions: graphqlHTTP.Options = {
  graphiql: true,
  rootValue: root,
  schema: gqlSchema
}

app.use('/graphql', graphqlHTTP(graphQlOptions));

const PORT = 3164;

app.listen(PORT, (err) => {
  if (err) {
    console.log(err);
  } else {
    console.log('HTTP server on http://localhost:%s', PORT);
  }
});
