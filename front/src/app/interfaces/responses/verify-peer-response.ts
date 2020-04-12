import { GraphQlError } from '../graphql';

export interface VerifyPeerRes {

  readonly data: {
    readonly verifyPeer: {
      readonly valid: boolean;
    };
  };
  readonly errors: GraphQlError[];

}
