import { ObjectInfo } from './object-info';
import { PinnedInfo } from './pinned-info';

export interface Workspace {

  objects: ObjectInfo[];
  password: string,
  pinnedObjects: PinnedInfo[],
  users: string[]

}
