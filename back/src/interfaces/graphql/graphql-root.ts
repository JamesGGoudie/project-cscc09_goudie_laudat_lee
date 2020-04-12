import { CreateWorkspaceReq, JoinWorkspaceReq } from '../requests';
import { CreateWorkspaceRes, JoinWorkspaceRes } from '../responses';

export interface GraphQlRoot {

  /**
   * Creates the workspace.
   *
   * This requires that the workspace ID not already be in use.
   *
   * When the workspace is created, the user will be added to the workspace.
   *
   * This will return the Peer ID of the user required to establish a
   * connection with other users.
   */
  createWorkspace: (req: CreateWorkspaceReq) => Promise<CreateWorkspaceRes>;
  /**
   * Joins a pre-existing workspace.
   *
   * This requires that the workspace already exist, the user does not already
   * exist in the workspace, and the correct password was supplied.
   *
   * This will return the Peer ID of the user required to establish a
   * connetion with other users and the peer IDs of all other users currently
   * in the workspace so that these connections can be established.
   */
  joinWorkspace: (req: JoinWorkspaceReq) => Promise<JoinWorkspaceRes>;

}
