import { RtcMessageType } from 'src/app/enums';

import { RtcMessage } from './rtc-message';

export interface RtcPinObjMsg extends RtcMessage {

  type: RtcMessageType.PinObject;

  objectId: string;

}
