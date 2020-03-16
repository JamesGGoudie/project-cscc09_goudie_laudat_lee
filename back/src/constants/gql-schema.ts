import { buildSchema } from 'graphql';

export const GQL_SCHEMA = buildSchema(`
  type ObjectInfo {
    objectId: String!,
    version: Int!,
    name: String!,
    geometryType: String!
    position: [Float!]!,
    rotation: [Float!]!
    scale: [Float!]!,
    materialColorHex: String!,
  }

  type Query {
    getWorkspace(
      workspaceId: String!
    ): [ObjectInfo]
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
    ): Boolean
    pinObject(
      objectId: String!,
      userId: String!,
      workspaceId: String!
    ): Boolean
    unpinObject(
      objectId: String!,
      userId: String!,
      workspaceId: String!
    ): Boolean
    reportChanges(
      objectId: String!,
      userId: String!,
      workspaceId: String!,
      version: Int!,
      name: String!,
      type: String!,
      posX: Float!,
      posY: Float!,
      posZ: Float!,
      rotX: Float!,
      rotY: Float!,
      rotZ: Float!,
      scaX: Float!,
      scaY: Float!,
      scaZ: Float!,
      col: String!
    ): Boolean
    deleteObject(
      objectId: String!,
      userId: String!,
      workspaceId: String!
    ): Boolean
  }
`);
