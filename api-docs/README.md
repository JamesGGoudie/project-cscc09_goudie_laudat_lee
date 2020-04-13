# Architect 3D API Documentation

All of the various network requests made between clients and a client with
the server.

## GraphQL Backend

Requests sent from a client to the GraphQL backend.

Due to the nature of GraphQL, some errors are returned as 200s.

### Create Workspace

- Description: Creates a new workspace
- Request: `POST https://www.architect3d.me/graphql`
  - accept: `application/json`
  - content-type: `application/json`
  - body: object
    - query: (string)
      ```
      mutation Create(
        $workspaceId: String!,
        $workspacePassword: String!,
        $userId: String!
      ) {
        createWorkspace(
          workspaceId: $workspaceId,
          workspacePassword: $workspacePassword,
          userId: $userId
        ) {
          yourPeerId
        }
      }
      ```
    - variables: object
      - workspaceId: (string) The ID of the workspace
      - workspacePassword: (string) The password of the workspace
      - userId: (string) The ID of the user
- Response: 200
  - content-type: `application/json`
  - body: object
    - data: object
      - createWorkspace: object
        - yourPeerId: (string) The Peer ID assigned to the user
- Response: 200
  - content-type: `application/json`
  - body: object
    - errors: \[object\]
      - \[0\]: object
        - message: `Workspace already exists`

### Join Workspace

- Description: Join an existing workspace
- Request: `POST https://www.architect3d.me/graphql`
  - accept: `application/json`
  - content-type: `application/json`
  - body: object
    - query: (string)
      ```
      mutation Join(
          $workspaceId: String!,
          $workspacePassword: String!,
          $userId: String!
      ) {
        joinWorkspace(
          workspaceId: $workspaceId,
          workspacePassword: $workspacePassword,
          userId: $userId
        ) {
          yourPeerId,
          otherPeerIds
        }
      }
      ```
    - variables: object
      - workspaceId: (string) The ID of the workspace
      - workspacePassword: (string) The password of the workspace
      - userId: (string) The ID of the user
- Response: 200
  - content-type: `application/json`
  - body: object
    - data: object
      - joinWorkspace: object
        - yourPeerId: (string) The Peer ID assigned to the user
        - otherPeerIds: (\[string\]) The Peer IDs of all other users in the
              workspace
- Response: 200
  - content-type: `application/json`
  - body: object
    - errors: \[object\]
      - \[0\]: object
        - message: `Workspace does not exist`
- Response: 200
  - content-type: `application/json`
  - body: object
    - errors: \[object\]
      - \[0\]: object
        - message: `Username is taken`
- Response: 200
  - content-type: `application/json`
  - body: object
    - errors: \[object\]
      - \[0\]: object
        - message: `Wrong password`

### Verify Peer

- Description: Check if the peer is in the same workspace as you
- Request: `POST https://www.architect3d.me/graphql`
  - accept: `application/json`
  - content-type: `application/json`
  - body: object
    - query: (string)
      ```
      query Verify(
          $peerId: String!,
          $workspaceId: String!
      ) {
        verifyPeer(
          peerId: $peerId,
          workspaceId: $workspaceId
        ) {
          valid
        }
      }
      ```
    - variables: object
      - peerId: (string) The peer ID of the client to verify
      - workspaceId: (string) The ID of the workspace
- Response: 200
  - content-type: `application/json`
  - body: object
    - data: object
      - verifyPeer: object
        - valid: (boolean) True iff the peer belongs to the workspace

## PeerJS RTC (Websockets)

Messages sent between clients through a PeerJS connection, thereby enabling
a real-time connection.

All RTC communications between two clients are on the same channel.

Note that messages don't typically have responses.
Anything that would be a response is documented as another message.

### Connection Verified Message

- Description: Inform the client that you have verified that they belong in the
    workspace
- Message: object
  - type: (7) The ID of the type of message

### Copy Workspace Request

- Description: Ask the client for the current layout of the workspace
- Message: object
  - type: (5) The ID of the type of message

### Copy Workspace Response

- Description: Send the client the current layout of the workspace
- Message: object
  - type: (6) The ID of the type of message
  - pins: \[object\]
    - oId: (string) The ID of the object
    - pId: (string) The peer ID of the user who has pinned the object
  - workspaceObjects: \[object\]
    - objectId: (string) The unique ID of the object
    - name: (string) The name of the object
    - geometryType: (string) The type of shape of the object
    - position: (\[number\])
      - \[0\]: (number) The X position of the object
      - \[1\]: (number) The Y position of the object
      - \[2\]: (number) The Z position of the object
    - rotation: (\[number\])
      - \[0\]: (number) The X rotation of the object
      - \[1\]: (number) The Y rotation of the object
      - \[2\]: (number) The Z rotation of the object
    - scale: (\[number\])
      - \[0\]: (number) The X scale of the object
      - \[1\]: (number) The Y scale of the object
      - \[2\]: (number) The Z scale of the object
    - materialColorHex: (string) The colour of the object

### Pin Object Message

- Description: Tell the client that you have pinned this object so that no one
    else can touch it
- Message: object
  - type: (0) The ID of the type of message
  - objectId: (string) The unique ID of the object

### Unpin Object Message

- Description: Tell the client that you have unpinned the object so others can
    edit it
- Message: object
  - type: (1) The ID of the type of message
  - objectId: (string) The unique ID of the object

### Create Object Message

- Description: Inform the client of the state of a new object and tell them to
    update their workspace
- Message: object
  - type: (3) The ID of the type of message
  - objectInfo: object
    - objectId: (string) The unique ID of the object
    - name: (string) The name of the object
    - geometryType: (string) The type of shape of the object
    - position: (\[number\])
      - \[0\]: (number) The X position of the object
      - \[1\]: (number) The Y position of the object
      - \[2\]: (number) The Z position of the object
    - rotation: (\[number\])
      - \[0\]: (number) The X rotation of the object
      - \[1\]: (number) The Y rotation of the object
      - \[2\]: (number) The Z rotation of the object
    - scale: (\[number\])
      - \[0\]: (number) The X scale of the object
      - \[1\]: (number) The Y scale of the object
      - \[2\]: (number) The Z scale of the object
    - materialColorHex: (string) The colour of the object

### Modify Object Message

- Description: Inform the client of the state of a pre-existing object and tell
    them to update their workspace
- Message: object
  - type: (4) The ID of the type of message
  - objectInfo: object
    - objectId: (string) The unique ID of the object
    - name: (string) The name of the object
    - geometryType: (string) The type of shape of the object
    - position: (\[number\])
      - \[0\]: (number) The X position of the object
      - \[1\]: (number) The Y position of the object
      - \[2\]: (number) The Z position of the object
    - rotation: (\[number\])
      - \[0\]: (number) The X rotation of the object
      - \[1\]: (number) The Y rotation of the object
      - \[2\]: (number) The Z rotation of the object
    - scale: (\[number\])
      - \[0\]: (number) The X scale of the object
      - \[1\]: (number) The Y scale of the object
      - \[2\]: (number) The Z scale of the object
    - materialColorHex: (string) The colour of the object

### Delete Object Message

- Description: Inform that client that the object has been removed and tell
    them to update their workspace
- Message: object
  - type: (2) The ID of the type of message
  - objectId: (string) The unique ID of the object
