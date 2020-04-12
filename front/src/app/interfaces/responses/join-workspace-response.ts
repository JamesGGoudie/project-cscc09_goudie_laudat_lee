import { GraphQlError } from '../graphql';

export interface JoinWorkspaceRes {

  readonly data: {
    readonly joinWorkspace: {
      readonly err: string;
      readonly otherPeerIds: string[];
      readonly yourPeerId: string;
    };
  };
  readonly errors: GraphQlError[];

}
