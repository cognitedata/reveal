import { Button, Tooltip as CogsTooltip, ChevronDownIcon, ChevronUpIcon } from '@cognite/cogs.js';
import { Menu, Option, Select } from '@cognite/cogs-lab';
import { useState, type ReactElement, type SetStateAction, type Dispatch } from 'react';

import { type BaseCommand } from '../../architecture/base/commands/BaseCommand';
import { type BaseOptionCommand } from '../../architecture/base/commands/BaseOptionCommand';
import { getButtonType, getTooltipPlacement } from './utilities';
import { LabelWithShortcut } from './LabelWithShortcut';
import { DEFAULT_PADDING, TOOLTIP_DELAY } from './constants';

import styled from 'styled-components';
import { type PlacementType } from './types';
import { useCommand } from './useCommand';
import { useCommandVisible, useCommandProps } from './useCommandProps';

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
            type={getButtonType(command)}
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
      <StyledLabel>{label}</StyledLabel>
      <StyledSelect
        defaultValue={command.selectedChild}
        fullWidth
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

const StyledLabel = styled.label`
  flex: 1 1;
`;

const StyledSelect = styled(Select<BaseCommand>)`
  flex: 1 1;
`;

const StyledDropdownRow = styled.div`
  display: flex;
  flex-direction: row;
  align-self: stretch;
  align-items: center;
  padding: ${DEFAULT_PADDING};
`;
