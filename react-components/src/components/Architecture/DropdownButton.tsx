import {
  Button,
  Tooltip as CogsTooltip,
  ChevronDownIcon,
  ChevronUpIcon,
  Body
} from '@cognite/cogs.js';
import { Menu, Option, Select } from '@cognite/cogs-lab';
import { useState, type ReactElement, type SetStateAction, type Dispatch } from 'react';

import { type BaseCommand } from '../../architecture/base/commands/BaseCommand';
import { BaseOptionCommand, OptionType } from '../../architecture/base/commands/BaseOptionCommand';
import { getTooltipPlacement } from './utilities';
import { LabelWithShortcut } from './LabelWithShortcut';
import { TOOLTIP_DELAY } from './constants';

import styled from 'styled-components';
import { type PlacementType } from './types';
import { useCommand } from './hooks/useCommand';
import { useCommandVisible, useCommandProps } from './hooks/useCommandProps';

export function createDropdownButton(
  command: BaseCommand,
  placement: PlacementType
): ReactElement | undefined {
  if (command instanceof BaseOptionCommand && command.optionType === OptionType.Dropdown) {
    return <DropdownButton key={command.uniqueId} inputCommand={command} placement={placement} />;
  }
  return undefined;
}

export const DropdownButton = ({
  inputCommand,
  placement,
  usedInSettings = false
}: {
  inputCommand: BaseOptionCommand;
  placement: PlacementType;
  usedInSettings?: boolean;
}): ReactElement => {
  const command = useCommand(inputCommand);
  const isVisible = useCommandVisible(command);
  if (!isVisible) {
    return <></>;
  }

  return usedInSettings ? (
    <MenuItemWithDropdown command={command} />
  ) : (
    <DropdownElement command={command} placement={placement} />
  );
};

const DropdownElement = ({
  command,
  placement
}: {
  command: BaseOptionCommand;
  placement: PlacementType;
}): ReactElement => {
  const { uniqueId, isEnabled } = useCommandProps(command);
  const [isOpen, setOpen] = useState(false);

  if (command.children === undefined) {
    return <></>;
  }

  const label = command.label;
  const selectedLabel = command.selectedChild?.label;
  const isDisabled = label === undefined || isOpen;
  const OpenButtonIcon = isOpen ? ChevronUpIcon : ChevronDownIcon;

  return (
    <Menu
      onOpenChange={(open: boolean) => {
        setOpen(open);
      }}
      open={isOpen}
      placement={'bottom-start'}
      disableCloseOnClickInside
      renderTrigger={(props: any) => (
        <CogsTooltip
          content={<LabelWithShortcut label={label} command={command} />}
          disabled={isDisabled}
          enterDelay={TOOLTIP_DELAY}
          placement={getTooltipPlacement(placement)}>
          <Button
            style={{
              padding: '8px 4px'
            }}
            type={command.buttonType}
            icon={<OpenButtonIcon />}
            key={uniqueId}
            disabled={!isEnabled}
            iconPlacement="left"
            aria-label={command.label}
            toggled={isOpen}
            {...props}
            onClick={(event) => {
              event.stopPropagation();
              event.preventDefault();
              props.onClick?.(event);
            }}>
            {selectedLabel}
          </Button>
        </CogsTooltip>
      )}>
      {command.children.map((child) => createMenuItem(child, setOpen))}
    </Menu>
  );
};

const MenuItemWithDropdown = ({ command }: { command: BaseOptionCommand }): ReactElement => {
  const label = command.label;

  if (command.children === undefined) {
    return <></>;
  }

  return (
    <StyledDropdownRow>
      <StyledDropdownLabel title={label} size="medium">
        {label}
      </StyledDropdownLabel>
      <StyledSelect
        defaultValue={command.selectedChild}
        aria-label={command.label}
        onChange={(_event, value) => {
          value?.invoke();
        }}>
        {command.children.map((child) => (
          <Option value={child} key={child.uniqueId}>
            {child.label}
          </Option>
        ))}
      </StyledSelect>
    </StyledDropdownRow>
  );
};

function createMenuItem(
  command: BaseCommand,
  setOpen: Dispatch<SetStateAction<boolean>>
): ReactElement {
  const { uniqueId, isEnabled, isChecked } = useCommandProps(command);
  return (
    <Menu.ItemToggled
      key={uniqueId}
      disabled={!isEnabled}
      toggled={isChecked}
      label={command.label}
      onClick={() => {
        command.invoke();
        setOpen(false);
      }}
    />
  );
}

const StyledSelect = styled(Select<BaseCommand>)`
  flex: 1 1;

  .cogs-lab-select-toggle {
    min-width: 100% !important;
  }
`;

const StyledDropdownRow = styled.div`
  display: flex;
  flex-direction: row;
  align-self: stretch;
  align-items: center;
  gap: 12px;
`;

const StyledDropdownLabel = styled(Body)`
  width: 80px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;
