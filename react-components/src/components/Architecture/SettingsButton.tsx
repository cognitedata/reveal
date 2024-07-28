/*!
 * Copyright 2024 Cognite AS
 */

import { useCallback, useEffect, useMemo, useState, type ReactElement } from 'react';
import {
  Button,
  Dropdown,
  Menu,
  Tooltip as CogsTooltip,
  type IconType,
  Slider
} from '@cognite/cogs.js';
import { useTranslation } from '../i18n/I18n';
import { type BaseCommand } from '../../architecture/base/commands/BaseCommand';
import { useRenderTarget } from '../RevealCanvas/ViewerContext';
import {
  getButtonType,
  getDefaultCommand,
  getFlexDirection,
  getTooltipPlacement,
  getIcon
} from './utilities';
import { LabelWithShortcut } from './LabelWithShortcut';
import { type TranslateDelegate } from '../../architecture/base/utilities/TranslateKey';
import { ToggleCommand } from '../../architecture/base/commands/value/ToggleCommand';
import { SliderCommand } from '../../architecture/base/commands/value/SliderCommand';
import styled from 'styled-components';
import { SettingsCommand } from '../../architecture/base/concreteCommands/SettingsCommand';
import { createButton } from './CommandButtons';
import { BaseOptionCommand } from '../../architecture/base/commands/BaseOptionCommand';
import { OptionButton } from './OptionButton';

export const SettingsButton = ({
  inputCommand,
  isHorizontal = false
}: {
  inputCommand: SettingsCommand;
  isHorizontal: boolean;
}): ReactElement => {
  const renderTarget = useRenderTarget();
  const { t } = useTranslation();
  const command = useMemo<BaseCommand>(() => getDefaultCommand(inputCommand, renderTarget), []);

  const [isOpen, setOpen] = useState<boolean>(false);
  const [isEnabled, setEnabled] = useState<boolean>(true);
  const [isVisible, setVisible] = useState<boolean>(true);
  const [uniqueId, setUniqueId] = useState<number>(0);
  const [icon, setIcon] = useState<IconType | undefined>(undefined);

  const update = useCallback((command: BaseCommand) => {
    setEnabled(command.isEnabled);
    setVisible(command.isVisible);
    setUniqueId(command.uniqueId);
    setIcon(getIcon(command));
  }, []);

  useEffect(() => {
    update(command);
    command.addEventListener(update);
    return () => {
      command.removeEventListener(update);
    };
  }, [command]);

  if (!(command instanceof SettingsCommand)) {
    return <></>;
  }
  if (!isVisible) {
    return <></>;
  }
  const placement = getTooltipPlacement(isHorizontal);
  const tooltip = command.getLabel(t);
  const shortcut = command.getShortCutKeys();
  const flexDirection = getFlexDirection(isHorizontal);
  const commands = command.commands;

  return (
    <CogsTooltip
      content={<LabelWithShortcut label={tooltip} shortcut={shortcut} />}
      disabled={tooltip === undefined}
      appendTo={document.body}
      placement={placement}>
      <Dropdown
        visible={isOpen}
        hideOnSelect={false}
        appendTo={document.body}
        placement="auto-start"
        content={
          <Menu
            style={{
              minWidth: '0px',
              overflow: 'auto',
              flexDirection
            }}>
            {commands.map((command, _index): ReactElement | undefined => {
              return createMenuItem(command, t);
            })}
          </Menu>
        }>
        <Button
          type={getButtonType(command)}
          icon={icon}
          key={uniqueId}
          disabled={!isEnabled}
          toggled={isOpen}
          aria-label={tooltip}
          iconPlacement="right"
          onClick={() => {
            setOpen((prevState) => !prevState);
          }}
        />
      </Dropdown>
    </CogsTooltip>
  );
};

export function createMenuItem(
  command: BaseCommand,
  t: TranslateDelegate
): ReactElement | undefined {
  if (command instanceof ToggleCommand) {
    return createToggle(command, t);
  }
  if (command instanceof SliderCommand) {
    return createSlider(command, t);
  }
  if (command instanceof BaseOptionCommand) {
    return createOptionButton(command, t);
  }
  return createButton(command);
}

export function createToggle(command: ToggleCommand, t: TranslateDelegate): ReactElement {
  const [isChecked, setChecked] = useState(command.isChecked);
  if (!command.isEnabled) {
    return <></>;
  }
  return (
    <Menu.Item
      key={command.uniqueId}
      hasSwitch={true}
      disabled={!command.isEnabled}
      toggled={isChecked}
      iconPlacement="right"
      style={{ padding: '4px' }}
      onChange={() => {
        command.invoke();
        setChecked(command.isChecked);
      }}>
      {command.getLabel(t)}
    </Menu.Item>
  );
}

export function createSlider(command: SliderCommand, t: TranslateDelegate): ReactElement {
  const [value, setValue] = useState(command.value);

  if (!command.isEnabled) {
    return <></>;
  }
  return (
    <StyledDiv>
      <label>{command.getLabel(t)}</label>
      <StyledSlider
        min={command.min}
        max={command.max}
        step={command.step}
        onChange={(value: number) => {
          command.value = value;
          setValue(value);
        }}
        value={value}></StyledSlider>
    </StyledDiv>
  );
}

export function createOptionButton(command: BaseOptionCommand, t: TranslateDelegate): ReactElement {
  if (!command.isEnabled) {
    return <></>;
  }
  return (
    <StyledDiv>
      <label>{command.getLabel(t)}</label>
      <OptionButton inputCommand={command} isHorizontal={false} usedInSettings={true} />
    </StyledDiv>
  );
}

const StyledDiv = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 4px;
  font-size: 14px;
`;

const StyledSlider = styled(Slider)`
  offset-anchor: right top;
  float: right;
  display: inline;
  width: 120px;
`;
