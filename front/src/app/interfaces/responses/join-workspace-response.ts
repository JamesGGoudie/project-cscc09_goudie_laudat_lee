export interface JoinWorkspaceRes {
  readonly data: {
    readonly joinWorkspace: {
      readonly err: string;
      readonly otherPeerIds: string[];
      readonly yourPeerId: string;
    }
  }
}
