import { buildSchema, GraphQLSchema } from 'graphql';

/**
 * All of the types, queries, and mutations required to define the GraphQL
 * schema.
 */
export const GQL_SCHEMA: GraphQLSchema = buildSchema(`
  type CreateWsRes {
    yourPeerId: String!
  }
  type JoinWsRes {
    otherPeerIds: [String!]!,
    yourPeerId: String!
  }
  type VerifyPeerRes {
    valid: Boolean!
  }

  type Query {
    verifyPeer(
      peerId: String!,
      workspaceId: String!
    ): VerifyPeerRes
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
