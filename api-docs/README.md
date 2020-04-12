# Architect 3D API Documentation

All of the various network requests made between clients and a client with
the server.

## GraphQL Backend

Requests sent from a client to the GraphQL backend.

Due to the nature of GraphQL, some errors are returned as 200s.

### Create Workspace

- Description: Creates a new workspace

### Join Workspace

- Description: Join an existing workspace

### Verify Peer

- Description: Check if the peer is in the same workspace as you

## PeerJS RTC (Websockets)

Messages sent between clients through a PeerJS connection, thereby enabling
a real-time connection.

### Connection Verified Message

- Description: Inform the client that you have verified that they belong in the
    workspace

### Copy Workspace Request

- Description: Ask the client for the current layout of the workspace

### Copy Workspace Response

- Description: Send the client the current layout of the workspace

### Pin Object Message

- Description: Tell the client that you have pinned this object so that no one
    else can touch it

### Unpin Object Message

- Description: Tell the client that you have unpinned the object so others can
    edit it

### Create Object Message

- Description: Inform the client of the state of a new object and tell them to
    update their workspace

### Modify Object Message

- Description: Inform the client of the state of a pre-existing object and tell
    them to update their workspace

### Delete Object Message

- Description: Inform that client that the object has been removed and tell
    them to update their workspace
