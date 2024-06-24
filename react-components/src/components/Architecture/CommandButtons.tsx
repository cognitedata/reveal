/*!
 * Copyright 2023 Cognite AS
 */

import { type ReactElement } from 'react';
import { Divider } from '@cognite/cogs.js';
import { type BaseCommand } from '../../architecture/base/commands/BaseCommand';
import { OptionButton } from './OptionButton';
import { BaseOptionCommand } from '../../architecture/base/commands/BaseOptionCommand';
import { CommandButton } from './CommandButton';

export const CreateButton = (command: BaseCommand, isHorizontal = false): ReactElement => {
  if (command instanceof BaseOptionCommand) {
    return <OptionButton inputCommand={command} isHorizontal={isHorizontal} />;
  } else {
    return <CommandButton inputCommand={command} isHorizontal={isHorizontal} />;
  }
};

export const CommandButtons = ({
  commands,
  isHorizontal = false
}: {
  commands: Array<BaseCommand | undefined>;
  isHorizontal: boolean;
}): ReactElement => {
  return (
    <>
      {commands.map(
        (command, index): ReactElement => (
          <CommandButtonWrapper
            command={command}
            isHorizontal={isHorizontal}
            key={getKey(command, index)}
          />
        )
      )}
    </>
  );
};

function getKey(command: BaseCommand | undefined, index: number): number {
  if (command === undefined) {
    return -index;
  }
  return command.uniqueId;
}

function CommandButtonWrapper({
  command,
  isHorizontal
}: {
  command: BaseCommand | undefined;
  isHorizontal: boolean;
}): ReactElement {
  if (command === undefined) {
    const direction = !isHorizontal ? 'horizontal' : 'vertical';
    return <Divider weight="2px" length="24px" direction={direction} />;
  }
  return CreateButton(command);
}
