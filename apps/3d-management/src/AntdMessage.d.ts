// fix type for message.loading

import type { ThenableArgument } from 'antd/lib/message';

declare interface MessageType {
  then: (fill: ThenableArgument, reject?: ThenableArgument) => Promise<void>;
}

export default MessageType;
