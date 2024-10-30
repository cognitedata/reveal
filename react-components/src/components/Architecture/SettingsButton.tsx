/*!
 * Copyright 2024 Cognite AS
 */

import { useMemo, useState, type ReactElement } from 'react';
import { Button, Tooltip as CogsTooltip, Slider, Switch } from '@cognite/cogs.js';
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
import { DEFAULT_PADDING, TOOLTIP_DELAY } from './constants';
import { type IconName } from '../../architecture/base/utilities/IconName';
import { IconComponent } from './IconComponentMapper';

import { TOOLBAR_HORIZONTAL_PANEL_OFFSET } from '../constants';

import { offset } from '@floating-ui/dom';
import { DividerCommand } from '../../architecture/base/commands/DividerCommand';
import { SectionCommand } from '../../architecture/base/commands/SectionCommand';
import { useOnUpdate } from './useOnUpdate';
import { type PlacementType } from './types';

export const SettingsButton = ({
  inputCommand,
  placement
}: {
  inputCommand: BaseSettingsCommand;
  placement: PlacementType;
}): ReactElement => {
  const renderTarget = useRenderTarget();
  const { t } = useTranslation();
  const command = useMemo<BaseSettingsCommand>(
    () => getDefaultCommand<BaseSettingsCommand>(inputCommand, renderTarget),
    []
  );

  // @update-ui-component-pattern
  const [isOpen, setOpen] = useState(false);
  const [isEnabled, setEnabled] = useState(true);
  const [isVisible, setVisible] = useState(true);
  const [uniqueId, setUniqueId] = useState(0);
  const [icon, setIcon] = useState<IconName | undefined>(undefined);

  useOnUpdate(command, () => {
    setEnabled(command.isEnabled);
    setVisible(command.isVisible);
    setUniqueId(command.uniqueId);
    setIcon(getIcon(command));
  });
  // @end

  if (!isVisible || !command.hasChildren) {
    return <></>;
  }
  const label = command.getLabel(t);
  const flexDirection = getFlexDirection(placement);
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
          disabled={isOpen || label === undefined}
          appendTo={document.body}
          enterDelay={TOOLTIP_DELAY}
          placement={getTooltipPlacement(placement)}>
          <Button
            type={getButtonType(command)}
            icon={<IconComponent iconName={icon} />}
            key={uniqueId}
            disabled={!isEnabled}
            toggled={isOpen}
            aria-label={label}
            iconPlacement="left"
            {...props}
          />
        </CogsTooltip>
      )}>
      {children.map((child): ReactElement | undefined => {
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
    return createDropdownButton(command);
  }
  if (command instanceof BaseFilterCommand) {
    return createFilterButton(command);
  }
  if (command.isToggle) {
    return createToggle(command, t);
  }
  if (command instanceof DividerCommand) {
    return createDivider(command);
  }
  if (command instanceof SectionCommand) {
    return createSection(command, t);
  }
  return createButton(command, t);
}

function createDivider(command: BaseCommand): ReactElement | undefined {
  // @update-ui-component-pattern
  const [isVisible, setVisible] = useState(true);
  const [uniqueId, setUniqueId] = useState(0);

  useOnUpdate(command, () => {
    setVisible(command.isVisible);
    setUniqueId(command.uniqueId);
  });
  // @end

  if (!isVisible) {
    return <></>;
  }
  return <Menu.Divider key={uniqueId} />;
}

function createSection(command: BaseCommand, t: TranslateDelegate): ReactElement | undefined {
  // @update-ui-component-pattern
  const [isVisible, setVisible] = useState(true);
  const [uniqueId, setUniqueId] = useState(0);

  useOnUpdate(command, () => {
    setVisible(command.isVisible);
    setUniqueId(command.uniqueId);
  });
  // @end

  if (!isVisible) {
    return <></>;
  }
  const label = command.getLabel(t);
  return <Menu.Section key={uniqueId} label={label} />;
}

function createToggle(command: BaseCommand, t: TranslateDelegate): ReactElement {
  // @update-ui-component-pattern
  const [isChecked, setChecked] = useState(false);
  const [isEnabled, setEnabled] = useState(true);
  const [isVisible, setVisible] = useState(true);
  const [uniqueId, setUniqueId] = useState(0);

  useOnUpdate(command, () => {
    setChecked(command.isChecked);
    setEnabled(command.isEnabled);
    setVisible(command.isVisible);
    setUniqueId(command.uniqueId);
  });
  // @end

  if (!isVisible) {
    return <></>;
  }

  const label = command.getLabel(t);
  return (
    <Menu.ItemAction
      key={uniqueId}
      label={label}
      disabled={!isEnabled}
      onClick={() => {
        command.invoke();
        setChecked(command.isChecked);
      }}
      trailingContent={<Switch checked={isChecked} disabled={!isEnabled} />}
    />
  );
}

function createButton(command: BaseCommand, t: TranslateDelegate): ReactElement {
  // @update-ui-component-pattern
  const [isChecked, setChecked] = useState(false);
  const [isEnabled, setEnabled] = useState(true);
  const [isVisible, setVisible] = useState(true);
  const [uniqueId, setUniqueId] = useState(0);
  const [icon, setIcon] = useState<IconName | undefined>(undefined);

  useOnUpdate(command, () => {
    setChecked(command.isChecked);
    setEnabled(command.isEnabled);
    setVisible(command.isVisible);
    setUniqueId(command.uniqueId);
    setIcon(getIcon(command));
  });
  // @end

  if (!isVisible) {
    return <></>;
  }
  const label = command.getLabel(t);
  return (
    <Menu.ItemAction
      key={uniqueId}
      disabled={!isEnabled}
      toggled={isChecked}
      icon={<IconComponent iconName={icon} />}
      iconPlacement="left"
      style={{ padding: DEFAULT_PADDING }}
      shortcutKeys={command.getShortCutKeys()}
      label={label}
      onClick={() => {
        command.invoke();
        setChecked(command.isChecked);
      }}
    />
  );
}

function createSlider(command: BaseSliderCommand, t: TranslateDelegate): ReactElement {
  // @update-ui-component-pattern
  const [isEnabled, setEnabled] = useState(true);
  const [isVisible, setVisible] = useState(true);
  const [uniqueId, setUniqueId] = useState(0);
  const [value, setValue] = useState(command.value);

  useOnUpdate(command, () => {
    setEnabled(command.isEnabled);
    setVisible(command.isVisible);
    setUniqueId(command.uniqueId);
    if (command instanceof BaseSliderCommand) {
      setValue(command.value);
    }
  });
  // @end

  if (!isVisible) {
    return <></>;
  }
  const label = command.getLabel(t) + ': ' + command.getValueLabel();
  return (
    <SliderDiv key={uniqueId}>
      <label>{label}</label>
      <StyledSlider
        disabled={!isEnabled}
        min={command.min}
        max={command.max}
        step={command.step}
        onChange={(value: number) => {
          command.value = value;
          setValue(value);
        }}
        value={value}
      />
    </SliderDiv>
  );
}

function createDropdownButton(command: BaseOptionCommand): ReactElement {
  // @update-ui-component-pattern
  const [isVisible, setVisible] = useState(true);
  const [uniqueId, setUniqueId] = useState(0);

  useOnUpdate(command, () => {
    setVisible(command.isVisible);
    setUniqueId(command.uniqueId);
  });
  // @end

  if (!isVisible) {
    return <></>;
  }
  return (
    <DropdownButton
      key={uniqueId}
      inputCommand={command}
      placement={'bottom'}
      usedInSettings={true}
    />
  );
}

function createFilterButton(command: BaseFilterCommand): ReactElement {
  command.initializeChildrenIfNeeded();

  // @update-ui-component-pattern
  const [isVisible, setVisible] = useState(true);
  const [uniqueId, setUniqueId] = useState(0);

  useOnUpdate(command, () => {
    setVisible(command.isVisible);
    setUniqueId(command.uniqueId);
  });
  // @end

  if (!isVisible) {
    return <></>;
  }
  return (
    <FilterButton
      key={uniqueId}
      inputCommand={command}
      placement={'bottom'}
      usedInSettings={true}
    />
  );
}

const SliderDiv = styled.div`
  display: flex;
  flex-direction: column;
  align-items: start;
  justify-content: space-between;
  gap: 8px;
  padding: 4px 8px;
  font-size: 14px;
`;

const StyledSlider = styled(Slider)`
  offset-anchor: right top;
  float: center;
  display: flex;
  justify-content: space-around;
`;
