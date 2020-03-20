import { RtcMessageType } from 'src/app/enums';

import { RtcMessage } from './rtc-message';

export interface RtcCopyWsReq extends RtcMessage {

  type: RtcMessageType.CopyWorkspaceReq;

}
