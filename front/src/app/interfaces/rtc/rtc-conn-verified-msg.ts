import { RtcMessageType } from 'src/app/enums';

import { RtcMessage } from './rtc-message';

export interface RtcConnVerifiedMsg extends RtcMessage {

  type: RtcMessageType.ConnectionVerified;

}
