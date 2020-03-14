export interface Workspace {

  password: string,
  pinnedObjects: {
    objectId: string,
    userId: string
  }[],
  users: string[]

}
