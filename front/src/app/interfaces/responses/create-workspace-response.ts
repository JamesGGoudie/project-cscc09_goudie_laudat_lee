import { GraphQlError } from '../graphql';

export interface CreateWorkspaceRes {

  readonly data: {
    readonly createWorkspace: {
      readonly err: string;
      readonly yourPeerId: string;
    };
  };
  readonly errors: GraphQlError[];

}
