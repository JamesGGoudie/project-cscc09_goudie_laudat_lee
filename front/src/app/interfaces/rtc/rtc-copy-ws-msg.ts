import { RtcMessageType } from 'src/app/enums';

import { ObjectInfo } from '../models';

import { RtcMessage } from './rtc-message';

export interface RtcCopyWsMsg extends RtcMessage {

  type: RtcMessageType.CopyWorkspace;

  workspaceObjects: ObjectInfo[];

}
