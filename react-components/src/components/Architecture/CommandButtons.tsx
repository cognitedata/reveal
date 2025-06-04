import { useMemo, type ReactElement } from 'react';
import { Divider } from '@cognite/cogs.js';
import { type BaseCommand } from '../../architecture/base/commands/BaseCommand';
import { DropdownButton } from './DropdownButton';
import { BaseOptionCommand, OptionType } from '../../architecture/base/commands/BaseOptionCommand';
import { CommandButton } from './CommandButton';
import { SettingsButton } from './SettingsButton';
import { BaseSettingsCommand } from '../../architecture/base/commands/BaseSettingsCommand';
import { BaseFilterCommand } from '../../architecture/base/commands/BaseFilterCommand';
import { FilterButton } from './FilterButton';
import { SegmentedButtons } from './SegmentedButtons';
import { DividerCommand } from '../../architecture/base/commands/DividerCommand';
import { SectionCommand } from '../../architecture/base/commands/SectionCommand';
import { type PlacementType } from './types';
import { type ButtonProp } from './RevealButtons';
import { getDividerDirection } from './utilities';
import { InputField } from './InputField';
import { BaseInputCommand } from '../../architecture/base/commands/BaseInputCommand';
import { CustomBaseInputCommand } from '../../architecture/base/commands/CustomBaseInputCommand';
import { CustomInputField } from './CustomInputField';

export function createButton(command: BaseCommand, placement: PlacementType): ReactElement {
  if (command instanceof BaseFilterCommand) {
    return <FilterButton key={command.uniqueId} inputCommand={command} placement={placement} />;
  }
  if (command instanceof BaseSettingsCommand) {
    return <SettingsButton key={command.uniqueId} inputCommand={command} placement={placement} />;
  }
  if (command instanceof BaseOptionCommand) {
    switch (command.optionType) {
      case OptionType.Dropdown:
        return (
          <DropdownButton key={command.uniqueId} inputCommand={command} placement={placement} />
        );
      case OptionType.Segmented:
        return (
          <SegmentedButtons key={command.uniqueId} inputCommand={command} placement={placement} />
        );
      default:
        return <></>;
    }
  }

  if (command instanceof BaseInputCommand) {
    return <InputField key={command.uniqueId} inputCommand={command} />;
  }

  if (command instanceof CustomBaseInputCommand) {
    return <CustomInputField key={command.uniqueId} inputCommand={command} placement={placement} />;
  }

  return <CommandButton key={command.uniqueId} inputCommand={command} placement={placement} />;
}

export function createButtonFromCommandConstructor(
  commandConstructor: () => BaseCommand,
  prop: ButtonProp
): ReactElement {
  const command = useMemo(commandConstructor, []);
  return createButton(command, prop.toolbarPlacement ?? 'left');
}

export const CommandButtons = ({
  commands,
  placement
}: {
  commands: Array<BaseCommand | undefined>;
  placement: PlacementType;
}): ReactElement => {
  return (
    <>
      {commands.map(
        (command, index): ReactElement => (
          <CommandButtonWrapper
            command={command}
            placement={placement}
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
  placement
}: {
  command: BaseCommand | undefined;
  placement: PlacementType;
}): ReactElement {
  if (
    command instanceof DividerCommand ||
    command instanceof SectionCommand ||
    command === undefined
  ) {
    const direction = getDividerDirection(placement);
    return <Divider weight="2px" length="24px" direction={direction} />;
  }
  return createButton(command, placement);
}
