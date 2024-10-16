/*!
 * Copyright 2024 Cognite AS
 */

import {
  type MouseEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactElement
} from 'react';
import { Button, Tooltip as CogsTooltip, Slider } from '@cognite/cogs.js';
import { Menu } from '@cognite/cogs-lab';
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
import { type BaseSettingsCommand } from '../../architecture/base/commands/BaseSettingsCommand';
import { BaseOptionCommand } from '../../architecture/base/commands/BaseOptionCommand';
import { DropdownButton } from './DropdownButton';
import { BaseSliderCommand } from '../../architecture/base/commands/BaseSliderCommand';
import { BaseFilterCommand } from '../../architecture/base/commands/BaseFilterCommand';
import { FilterButton } from './FilterButton';
import { DEFAULT_PADDING } from './constants';
import { type IconName } from '../../architecture/base/utilities/IconName';
import { IconComponent } from './IconComponentMapper';

import { TOOLBAR_HORIZONTAL_PANEL_OFFSET } from '../constants';

import { offset } from '@floating-ui/dom';

export const SettingsButton = ({
  inputCommand,
  isHorizontal = false
}: {
  inputCommand: BaseSettingsCommand;
  isHorizontal: boolean;
}): ReactElement => {
  const renderTarget = useRenderTarget();
  const { t } = useTranslation();
  const command = useMemo<BaseSettingsCommand>(
    () => getDefaultCommand<BaseSettingsCommand>(inputCommand, renderTarget),
    []
  );

  // @update-ui-component-pattern
  const [isOpen, setOpen] = useState<boolean>(false);
  const [isEnabled, setEnabled] = useState<boolean>(true);
  const [isVisible, setVisible] = useState<boolean>(true);
  const [uniqueId, setUniqueId] = useState<number>(0);
  const [icon, setIcon] = useState<IconName | undefined>(undefined);

  const update = useCallback((command: BaseCommand) => {
    setEnabled(command.isEnabled);
    setVisible(command.isVisible);
    setUniqueId(command.uniqueId);
    setIcon(getIcon(command));
  }, []);
  // @end

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
    <Menu
      hideOnSelect={false}
      onOpenChange={(open: boolean) => {
        setOpen(open);
      }}
      floatingProps={{ middleware: [offset(TOOLBAR_HORIZONTAL_PANEL_OFFSET)] }}
      appendTo={'parent'}
      placement="right-start"
      style={{
        flexDirection,
        padding: DEFAULT_PADDING
      }}
      disableCloseOnClickInside
      renderTrigger={(props: any) => (
        <CogsTooltip
          content={<LabelWithShortcut label={label} command={command} />}
          disabled={label === undefined}
          appendTo={document.body}
          placement={placement}>
          <Button
            type={getButtonType(command)}
            icon={<IconComponent iconName={icon} />}
            key={uniqueId}
            disabled={!isEnabled}
            toggled={isOpen}
            aria-label={label}
            iconPlacement="left"
            {...props}
            onClick={(event: MouseEvent<HTMLElement>) => {
              props.onClick?.(event);
              event.stopPropagation();
              event.preventDefault();
            }}
          />
        </CogsTooltip>
      )}>
      {children.map((child, _index): ReactElement | undefined => {
        return createMenuItem(child, t);
      })}
    </Menu>
  );
};

function createMenuItem(command: BaseCommand, t: TranslateDelegate): ReactElement | undefined {
  if (command instanceof BaseSliderCommand) {
    return createSlider(command, t);
  }
  if (command instanceof BaseOptionCommand) {
    return createDropdownButton(command, t);
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
    <Menu.ItemToggled
      key={command.uniqueId}
      hasSwitch={true}
      disabled={!command.isEnabled}
      toggled={isChecked}
      style={{ padding: DEFAULT_PADDING }}
      label={command.getLabel(t)}
      onClick={() => {
        command.invoke();
        setChecked(command.isChecked);
      }}
    />
  );
}

function createButton(command: BaseCommand, t: TranslateDelegate): ReactElement {
  const [isChecked, setChecked] = useState(command.isChecked);
  if (!command.isVisible) {
    return <></>;
  }
  const label = command.getLabel(t);
  return (
    <Menu.ItemAction
      key={command.uniqueId}
      disabled={!command.isEnabled}
      toggled={isChecked}
      icon={<IconComponent iconName={getIcon(command)} />}
      iconPlacement="left"
      style={{ padding: DEFAULT_PADDING }}
      onClick={() => {
        command.invoke();
        setChecked(command.isChecked);
      }}>
      <LabelWithShortcut label={label} command={command} inverted={false} />
    </Menu.ItemAction>
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

function createDropdownButton(command: BaseOptionCommand, t: TranslateDelegate): ReactElement {
  if (!command.isVisible) {
    return <></>;
  }
  return (
    <OptionDiv>
      <label>{command.getLabel(t)}</label>
      <DropdownButton inputCommand={command} isHorizontal={false} usedInSettings={true} />
    </OptionDiv>
  );
}

function createFilterButton(command: BaseFilterCommand, t: TranslateDelegate): ReactElement {
  command.initializeChildrenIfNeeded();
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
