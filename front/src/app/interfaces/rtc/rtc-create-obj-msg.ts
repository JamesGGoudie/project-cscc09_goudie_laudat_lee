import { RtcMessageType } from 'src/app/enums';

import { ObjectInfo } from '../models';

import { RtcMessage } from './rtc-message';

export interface RtcCreateObjMsg extends RtcMessage {

  type: RtcMessageType.CreateObject;

  objectInfo: ObjectInfo;

}
