import { RtcMessageType } from 'src/app/enums';

import { ObjectInfo, PinInfo } from '../models';

import { RtcMessage } from './rtc-message';

export interface RtcCopyWsRes extends RtcMessage {

  type: RtcMessageType.CopyWorkspaceRes;

  pins: PinInfo[];
  workspaceObjects: ObjectInfo[];

}
