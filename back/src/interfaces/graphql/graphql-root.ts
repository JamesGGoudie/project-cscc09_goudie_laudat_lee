import { CreateWorkspaceReq, JoinWorkspaceReq } from '../requests';
import { CreateWorkspaceRes, JoinWorkspaceRes } from '../responses';

export interface GraphQlRoot {

  createWorkspace: (req: CreateWorkspaceReq) => Promise<CreateWorkspaceRes>;
  joinWorkspace: (req: JoinWorkspaceReq) => Promise<JoinWorkspaceRes>;

}
