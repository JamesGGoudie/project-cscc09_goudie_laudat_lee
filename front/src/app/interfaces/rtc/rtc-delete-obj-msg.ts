import { RtcMessageType } from 'src/app/enums';

import { RtcMessage } from './rtc-message';

export interface RtcDeleteObjMsg extends RtcMessage {

  type: RtcMessageType.DeleteObject;

  objectId: string;

}
