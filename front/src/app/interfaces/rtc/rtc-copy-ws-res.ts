import { RtcMessageType } from 'src/app/enums';

import { ObjectInfo } from '../models';

import { RtcMessage } from './rtc-message';

export interface RtcCopyWsRes extends RtcMessage {

  type: RtcMessageType.CopyWorkspaceRes;

  pins: string[];
  workspaceObjects: ObjectInfo[];

}
