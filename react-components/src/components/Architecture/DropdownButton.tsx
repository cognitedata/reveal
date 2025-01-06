/*!
 * Copyright 2024 Cognite AS
 */

import { Button, Tooltip as CogsTooltip, ChevronDownIcon, ChevronUpIcon } from '@cognite/cogs.js';
import { Menu, Option, Select } from '@cognite/cogs-lab';
import { useMemo, useState, type ReactElement, type SetStateAction, type Dispatch } from 'react';

import { useTranslation } from '../i18n/I18n';
import { type BaseCommand } from '../../architecture/base/commands/BaseCommand';
import { useRenderTarget } from '../RevealCanvas/ViewerContext';
import { type BaseOptionCommand } from '../../architecture/base/commands/BaseOptionCommand';
import { getButtonType, getDefaultCommand, getTooltipPlacement } from './utilities';
import { LabelWithShortcut } from './LabelWithShortcut';
import { type TranslateDelegate } from '../../architecture/base/utilities/TranslateInput';
import { DEFAULT_PADDING, OPTION_MIN_WIDTH, TOOLTIP_DELAY } from './constants';

import styled from 'styled-components';
import { useOnUpdate } from './useOnUpdate';
import { type PlacementType } from './types';
import { IconComponent } from './Factories/IconFactory';

export const DropdownButton = ({
  inputCommand,
  placement,
  usedInSettings = false
}: {
  inputCommand: BaseOptionCommand;
  placement: PlacementType;
  usedInSettings?: boolean;
}): ReactElement => {
  const renderTarget = useRenderTarget();
  const command = useMemo<BaseOptionCommand>(
    () => getDefaultCommand<BaseOptionCommand>(inputCommand, renderTarget),
    []
  );

  // @update-ui-component-pattern
  const [isOpen, setOpen] = useState(false);
  const [isEnabled, setEnabled] = useState(true);
  const [isVisible, setVisible] = useState(true);
  const [uniqueId, setUniqueId] = useState(0);

  useOnUpdate(command, () => {
    setEnabled(command.isEnabled);
    setVisible(command.isVisible);
    setUniqueId(command.uniqueId);
  });
  // @end

  if (!isVisible) {
    return <></>;
  }
  return usedInSettings ? (
    <MenuItemWithDropdown command={command} isVisible={isVisible} />
  ) : (
    <DropdownElement
      command={command}
      isVisible={isVisible}
      isOpen={isOpen}
      setOpen={setOpen}
      isEnabled={isEnabled}
      placement={placement}
      uniqueId={uniqueId}
    />
  );
};

const DropdownElement = ({
  command,
  isVisible,
  isOpen,
  setOpen,
  isEnabled,
  placement,
  uniqueId
}: {
  command: BaseOptionCommand;
  isVisible: boolean;
  isOpen: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  isEnabled: boolean;
  placement: PlacementType;
  uniqueId: number;
}): ReactElement => {
  const { t } = useTranslation();
  const label = command.getLabel(t);
  const selectedLabel = command.selectedChild?.getLabel(t);

  const OpenButtonIcon = isOpen ? ChevronUpIcon : ChevronDownIcon;

  if (!isVisible || command.children === undefined) {
    return <></>;
  }

  return (
    <Menu
      onOpenChange={(open: boolean) => {
        setOpen(open);
      }}
      placement={'bottom-start'}
      disableCloseOnClickInside
      renderTrigger={(props: any) => (
        <CogsTooltip
          content={<LabelWithShortcut label={label} command={command} />}
          disabled={label === undefined}
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
            aria-label={command.getLabel(t)}
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
      {command.children.map((child) => createMenuItem(child, t))}
    </Menu>
  );
};

const MenuItemWithDropdown = ({
  command,
  isVisible
}: {
  command: BaseOptionCommand;
  isVisible: boolean;
}): ReactElement => {
  const { t } = useTranslation();
  const label = command.getLabel(t);

  if (!isVisible || command.children === undefined) {
    return <></>;
  }

  return (
    <StyledDropdownRow>
      <label>{label}</label>
      <Select
        defaultValue={command.selectedChild}
        fullWidth
        aria-label={command.getLabel(t)}
        onChange={(_event, value) => {
          value?.invoke();
        }}>
        {command.children.map((child) => (
          <Option value={child} key={child.uniqueId}>
            {child.getLabel(t)}
          </Option>
        ))}
      </Select>
    </StyledDropdownRow>
  );
};

function createMenuItem(command: BaseCommand, t: TranslateDelegate): ReactElement {
  return (
    <Menu.ItemToggled
      key={command.uniqueId}
      disabled={!command.isEnabled}
      toggled={command.isChecked}
      label={command.getLabel(t)}
      onClick={() => {
        command.invoke();
      }}
    />
  );
}

const StyledDropdownRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: 8;
  minwidth: ${OPTION_MIN_WIDTH};
  padding: ${DEFAULT_PADDING};
`;
