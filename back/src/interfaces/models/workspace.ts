import { ObjectInfo } from './object-info';
import { PinnedInfo } from './pinned-info';

export interface Workspace {

  name: string;
  objects: ObjectInfo[];
  password: string;
  peerIds: string[];
  pinnedObjects: PinnedInfo[];
  users: string[];

}
