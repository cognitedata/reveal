/*!
 * Copyright 2022 Cognite AS
 */

import { parseEpt, EptInputData } from './parseEpt';

const ctx: Worker = self as any;

type CommandType = 'objects' | 'parse';

export interface ICommand {
  type: CommandType;
}

export type ParseCommand = {
  type: 'parse';
  data: EptInputData;
};

ctx.onmessage = function (event: MessageEvent<ICommand>) {
  const command = event.data as ICommand;

  switch (command.type) {
    case 'parse':
      const parseCommand = command as ParseCommand;
      parseEpt(ctx, parseCommand.data);
      break;
    default:
      console.error('Unrecognized eptBinaryDecoder worker command');
  }
};

export default null as any;
