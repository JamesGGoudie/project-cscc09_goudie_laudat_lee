import { GraphQlError } from '../graphql';

export interface CreateWorkspaceRes {

  readonly data: {
    readonly createWorkspace: {
      readonly yourPeerId: string;
    };
  };
  readonly errors: GraphQlError[];

}
