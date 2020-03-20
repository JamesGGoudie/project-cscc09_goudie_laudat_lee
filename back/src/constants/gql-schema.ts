import { buildSchema } from 'graphql';

export const GQL_SCHEMA = buildSchema(`
  type CreateWsRes {
    err: String,
    success: Boolean
  }
  type JoinWsRes {
    err: String,
    peers: [String!]
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
