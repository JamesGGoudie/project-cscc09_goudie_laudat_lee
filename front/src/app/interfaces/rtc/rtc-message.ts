import { RtcMessageType } from 'src/app/enums';

/**
 * Base class for RTC messages.
 *
 * Every message will have a type associated with it.
 * Using this type, we can determine which interface to use to represent the
 * message.
 */
export interface RtcMessage {

  type: RtcMessageType;

}
