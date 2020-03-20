import { buildSchema } from 'graphql';

export const GQL_SCHEMA = buildSchema(`
  type Query {
    dummy: Boolean
  }

  type Mutation {
    createWorkspace(
      workspaceId: String!,
      workspacePassword: String!,
      userId: String!
    ): Boolean
    joinWorkspace(
      workspaceId: String!,
      workspacePassword: String!,
      userId: String!
    ): [String!]!
  }
`);
