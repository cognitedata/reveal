/*!
 * Copyright 2024 Cognite AS
 */

import { useMemo, type ReactElement } from 'react';
import { Divider } from '@cognite/cogs.js';
import { type BaseCommand } from '../../architecture/base/commands/BaseCommand';
import { OptionButton } from './OptionButton';
import { BaseOptionCommand } from '../../architecture/base/commands/BaseOptionCommand';
import { CommandButton } from './CommandButton';
import { SettingsButton } from './SettingsButton';
import { BaseSettingsCommand } from '../../architecture/base/commands/BaseSettingsCommand';
import { BaseFilterCommand } from '../../architecture/base/commands/BaseFilterCommand';
import { FilterButton } from './FilterButton';
import { SegmentedButtons } from './SegmentedButtons';

export function createButton(command: BaseCommand, isHorizontal = false): ReactElement {
  if (command instanceof BaseFilterCommand) {
    return <FilterButton inputCommand={command} isHorizontal={isHorizontal} />;
  }
  if (command instanceof BaseSettingsCommand) {
    return <SettingsButton inputCommand={command} isHorizontal={isHorizontal} />;
  }
  if (command instanceof BaseOptionCommand) {
    if (command.isOptionMenu) {
      return <OptionButton inputCommand={command} isHorizontal={isHorizontal} />;
    } else {
      return <SegmentedButtons inputCommand={command} isHorizontal={isHorizontal} />;
    }
  }
  return <CommandButton inputCommand={command} isHorizontal={isHorizontal} />;
}

export function createButtonFromCommandConstructor(
  commandConstructor: () => BaseCommand,
  isHorizontal = false
): ReactElement {
  const command = useMemo(commandConstructor, []);
  return createButton(command, isHorizontal);
}

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
  return createButton(command, isHorizontal);
}
