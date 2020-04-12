import { buildSchema, GraphQLSchema } from 'graphql';

/**
 * All of the types, queries, and mutations required to define the GraphQL
 * schema.
 *
 * One of the requirements of a GraphQL schema is that it must have at least
 * one query.
 * Currently, there are no queries, but to satisfy this requirement, there is
 * the 'dummy' query that is without implementation.
 */
export const GQL_SCHEMA: GraphQLSchema = buildSchema(`
  type CreateWsRes {
    err: String,
    yourPeerId: String
  }
  type JoinWsRes {
    err: String,
    otherPeerIds: [String!],
    yourPeerId: String
  }

  type Query {
    dummy: Boolean
  }

  type Mutation {
    createWorkspace(
      workspaceId: String!,
      workspacePassword: String!,
      userId: String!
    ): CreateWsRes
    joinWorkspace(
      workspaceId: String!,
      workspacePassword: String!,
      userId: String!
    ): JoinWsRes
  }
`);
