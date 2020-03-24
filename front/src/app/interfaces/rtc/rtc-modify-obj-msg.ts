import { RtcMessageType } from 'src/app/enums';

import { ObjectInfo } from '../models';

import { RtcMessage } from './rtc-message';

export interface RtcModifyObjMsg extends RtcMessage {

  type: RtcMessageType.ModifyObject;

  objectInfo: ObjectInfo;

}
