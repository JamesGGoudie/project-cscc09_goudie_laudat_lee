import { RtcMessageType } from 'src/app/enums';

import { RtcMessage } from './rtc-message';

export interface RtcUnpinObjMsg extends RtcMessage {

  type: RtcMessageType.UnpinObject;

  objectId: string;

}
