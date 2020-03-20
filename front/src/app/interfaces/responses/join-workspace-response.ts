export interface JoinWorkspaceRes {
  readonly data: {
    readonly joinWorkspace: {
      readonly err: string;
      readonly peers: string[];
    }
  }
}
