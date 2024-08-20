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
import styled from 'styled-components';
import { type SettingsCommand } from '../../architecture/base/commands/SettingsCommand';
import { BaseOptionCommand } from '../../architecture/base/commands/BaseOptionCommand';
import { OptionButton } from './OptionButton';
import { BaseSliderCommand } from '../../architecture/base/commands/BaseSliderCommand';
import { BaseFilterCommand } from '../../architecture/base/commands/BaseFilterCommand';
import { FilterButton } from './FilterButton';

export const SettingsButton = ({
  inputCommand,
  isHorizontal = false
}: {
  inputCommand: SettingsCommand;
  isHorizontal: boolean;
}): ReactElement => {
  const renderTarget = useRenderTarget();
  const { t } = useTranslation();
  const command = useMemo<SettingsCommand>(
    () => getDefaultCommand<SettingsCommand>(inputCommand, renderTarget),
    []
  );

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

  if (!isVisible || !command.hasChildren) {
    return <></>;
  }
  const placement = getTooltipPlacement(isHorizontal);
  const label = command.getLabel(t);
  const flexDirection = getFlexDirection(isHorizontal);
  const children = command.children;

  return (
    <CogsTooltip
      content={<LabelWithShortcut label={label} command={command} />}
      disabled={label === undefined}
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
              flexDirection,
              padding: '4px 4px'
            }}>
            {children.map((child, _index): ReactElement | undefined => {
              return createMenuItem(child, t);
            })}
          </Menu>
        }>
        <Button
          type={getButtonType(command)}
          icon={icon}
          key={uniqueId}
          disabled={!isEnabled}
          toggled={isOpen}
          aria-label={label}
          iconPlacement="right"
          onClick={() => {
            setOpen((prevState) => !prevState);
          }}
        />
      </Dropdown>
    </CogsTooltip>
  );
};

function createMenuItem(command: BaseCommand, t: TranslateDelegate): ReactElement | undefined {
  if (command instanceof BaseSliderCommand) {
    return createSlider(command, t);
  }
  if (command instanceof BaseOptionCommand) {
    return createOptionButton(command, t);
  }
  if (command instanceof BaseFilterCommand) {
    return createFilterButton(command, t);
  }
  if (command.isToggle) {
    return createToggle(command, t);
  }
  return createButton(command, t);
}

function createToggle(command: BaseCommand, t: TranslateDelegate): ReactElement {
  const [isChecked, setChecked] = useState(command.isChecked);
  if (!command.isVisible) {
    return <></>;
  }
  return (
    <Menu.Item
      key={command.uniqueId}
      hasSwitch={true}
      disabled={!command.isEnabled}
      toggled={isChecked}
      style={{ padding: '4px 4px' }}
      onChange={() => {
        command.invoke();
        setChecked(command.isChecked);
      }}>
      {command.getLabel(t)}
    </Menu.Item>
  );
}

function createButton(command: BaseCommand, t: TranslateDelegate): ReactElement {
  const [isChecked, setChecked] = useState(command.isChecked);
  if (!command.isVisible) {
    return <></>;
  }
  const label = command.getLabel(t);
  return (
    <Menu.Item
      key={command.uniqueId}
      disabled={!command.isEnabled}
      toggled={isChecked}
      icon={getIcon(command)}
      iconPlacement="left"
      style={{ padding: '4px 4px' }}
      onClick={() => {
        command.invoke();
        setChecked(command.isChecked);
      }}>
      <LabelWithShortcut label={label} command={command} inverted={false} />
    </Menu.Item>
  );
}

function createSlider(command: BaseSliderCommand, t: TranslateDelegate): ReactElement {
  const [value, setValue] = useState(command.value);

  if (!command.isVisible) {
    return <></>;
  }
  return (
    <SliderDiv>
      <label>{command.getLabel(t)}</label>
      <StyledSlider
        disabled={!command.isEnabled}
        min={command.min}
        max={command.max}
        step={command.step}
        onChange={(value: number) => {
          command.value = value;
          setValue(value);
        }}
        value={value}></StyledSlider>
    </SliderDiv>
  );
}

function createOptionButton(command: BaseOptionCommand, t: TranslateDelegate): ReactElement {
  if (!command.isVisible) {
    return <></>;
  }
  return (
    <OptionDiv>
      <label>{command.getLabel(t)}</label>
      <OptionButton inputCommand={command} isHorizontal={false} usedInSettings={true} />
    </OptionDiv>
  );
}

function createFilterButton(command: BaseFilterCommand, t: TranslateDelegate): ReactElement {
  if (!command.isVisible) {
    return <></>;
  }
  return (
    <OptionDiv>
      <label>{command.getLabel(t)}</label>
      <FilterButton inputCommand={command} isHorizontal={false} usedInSettings={true} />
    </OptionDiv>
  );
}

const OptionDiv = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 4px 4px;
  font-size: 14px;
`;

const SliderDiv = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  padding: 4px 4px;
  font-size: 14px;
`;

const StyledSlider = styled(Slider)`
  offset-anchor: right top;
  float: right;
  display: inline;
  width: 120px;
`;
