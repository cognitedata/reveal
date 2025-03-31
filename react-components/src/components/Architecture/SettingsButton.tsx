/*!
 * Copyright 2024 Cognite AS
 */

import { type ReactNode, useMemo, useState, type ReactElement, PropsWithChildren } from 'react';
import {
  Button,
  Tooltip as CogsTooltip,
  Flex,
  SettingsIcon,
  Slider,
  Switch,
  TextLabel,
  WarningFilledIcon
} from '@cognite/cogs.js';
import { Dropdown, Menu } from '@cognite/cogs-lab';
import { useTranslation } from '../i18n/I18n';
import { type BaseCommand } from '../../architecture/base/commands/BaseCommand';
import { useRenderTarget } from '../RevealCanvas/ViewerContext';
import {
  getButtonType,
  getDefaultCommand,
  getFlexDirection,
  getTooltipPlacement
} from './utilities';
import { LabelWithShortcut } from './LabelWithShortcut';
import { type TranslateDelegate } from '../../architecture/base/utilities/TranslateInput';
import styled from 'styled-components';
import { type BaseSettingsCommand } from '../../architecture/base/commands/BaseSettingsCommand';
import {
  BaseOptionCommand,
  OptionType as OptionCommandType
} from '../../architecture/base/commands/BaseOptionCommand';
import { DropdownButton } from './DropdownButton';
import { BaseSliderCommand } from '../../architecture/base/commands/BaseSliderCommand';
import { BaseFilterCommand } from '../../architecture/base/commands/BaseFilterCommand';
import { FilterButton } from './FilterButton';
import { DEFAULT_PADDING, TOOLTIP_DELAY } from './constants';
import { type IconName } from '../../architecture/base/utilities/IconName';
import { IconComponent } from './Factories/IconFactory';

import { TOOLBAR_HORIZONTAL_PANEL_OFFSET } from '../constants';

import { offset } from '@floating-ui/dom';
import { DividerCommand } from '../../architecture/base/commands/DividerCommand';
import { SectionCommand } from '../../architecture/base/commands/SectionCommand';
import { useOnUpdate } from './useOnUpdate';
import { type PlacementType } from './types';
import { SegmentedButtons } from './SegmentedButtons';
import { BaseBannerCommand } from '../../architecture';
import { BannerComponent } from './BannerComponent';

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
  const [isVisible, setVisible] = useState(false);
  const [icon, setIcon] = useState<IconName>(undefined);

  useOnUpdate(command, () => {
    setEnabled(command.isEnabled);
    setVisible(command.isVisible);
    setIcon(command.icon);
  });
  // @end

  if (!isVisible || !command.hasChildren) {
    return <></>;
  }
  const label = command.getLabel(t);
  const children = command.children;

  return (
    <Dropdown
      disabled={!isEnabled}
      content={
        <StyledMenuPanel>
          <SettingsPanelHeader>
            <IconComponent iconName={icon} />
            {label}
          </SettingsPanelHeader>
          {children.map((child) => createMenuItem(child, t))}
        </StyledMenuPanel>
      }
      onShow={(open) => setOpen(open)}
      onHide={(open) => setOpen(open)}
      placement={'right-end'}
      offset={{ mainAxis: 8 }}>
      <Button disabled={!isEnabled} toggled={isOpen} type="ghost" icon={<SettingsIcon />} />
    </Dropdown>
  );
};

function SettingsPanelHeader({ children }: PropsWithChildren): ReactElement {
  return <StyledMenuHeader>{children}</StyledMenuHeader>;
}

function createMenuItem(command: BaseCommand, t: TranslateDelegate): ReactNode {
  if (command instanceof BaseSliderCommand) {
    return <SliderComponent key={command.uniqueId} command={command} t={t} />;
  }
  if (command instanceof BaseOptionCommand) {
    if (command.optionType === OptionCommandType.Segmented) {
      return <SegmentedButtonComponent key={command.uniqueId} command={command} />;
    } else {
      return <DropdownButtonComponent key={command.uniqueId} command={command} />;
    }
  }
  if (command instanceof BaseFilterCommand) {
    return <FilterButtonComponent key={command.uniqueId} command={command} />;
  }
  if (command.isToggle) {
    return <ToggleComponent key={command.uniqueId} command={command} t={t} />;
  }
  if (command instanceof DividerCommand) {
    return <DividerComponent key={command.uniqueId} command={command} />;
  }
  if (command instanceof SectionCommand) {
    return <SectionComponent key={command.uniqueId} command={command} t={t} />;
  }
  if (command instanceof BaseBannerCommand) {
    return (
      <BannerComponent key={command.uniqueId} inputCommand={command} translationDelegate={t} />
    );
  }

  return <ButtonComponent key={command.uniqueId} command={command} t={t} />;
}

function DividerComponent({ command }: { command: BaseCommand }): ReactNode {
  // @update-ui-component-pattern
  const [isVisible, setVisible] = useState(true);

  useOnUpdate(command, () => {
    setVisible(command.isVisible);
  });
  // @end

  if (!isVisible) {
    return null;
  }
  return <Menu.Divider />;
}

function SectionComponent({
  t,
  command
}: {
  command: BaseCommand;
  t: TranslateDelegate;
}): ReactNode {
  // @update-ui-component-pattern
  const [isVisible, setVisible] = useState(true);

  useOnUpdate(command, () => {
    setVisible(command.isVisible);
  });
  // @end

  if (!isVisible) {
    return null;
  }
  const label = command.getLabel(t);
  return <StyledSectionHeader>{label} </StyledSectionHeader>;
}

function ToggleComponent({
  command,
  t
}: {
  command: BaseCommand;
  t: TranslateDelegate;
}): ReactNode {
  // @update-ui-component-pattern
  const [isChecked, setChecked] = useState(false);
  const [isEnabled, setEnabled] = useState(true);
  const [isVisible, setVisible] = useState(true);

  useOnUpdate(command, () => {
    setChecked(command.isChecked);
    setEnabled(command.isEnabled);
    setVisible(command.isVisible);
  });
  // @end

  if (!isVisible) {
    return null;
  }

  const label = command.getLabel(t);
  return (
    <StyledToggleContainer
      onClick={() => {
        if (isEnabled) {
          command.invoke();
        }
      }}>
      <Switch checked={isChecked} disabled={!isEnabled} />
      <TextLabel text={label} />
    </StyledToggleContainer>
  );
}

function ButtonComponent({
  command,
  t
}: {
  command: BaseCommand;
  t: TranslateDelegate;
}): ReactNode {
  // @update-ui-component-pattern
  const [isEnabled, setEnabled] = useState(true);
  const [isVisible, setVisible] = useState(true);
  const [icon, setIcon] = useState<IconName>(undefined);

  useOnUpdate(command, () => {
    setEnabled(command.isEnabled);
    setVisible(command.isVisible);
    setIcon(command.icon);
  });
  // @end

  if (!isVisible) {
    return null;
  }
  const label = command.getLabel(t);

  return (
    <Menu.ItemAction
      disabled={!isEnabled}
      icon={<IconComponent iconName={icon} />}
      style={{ padding: DEFAULT_PADDING }}
      shortcutKeys={command.getShortCutKeys()}
      label={label}
      onClick={() => {
        command.invoke();
      }}
    />
  );
}

function SliderComponent({
  command,
  t
}: {
  command: BaseSliderCommand;
  t: TranslateDelegate;
}): ReactNode {
  // @update-ui-component-pattern
  const [isEnabled, setEnabled] = useState(true);
  const [isVisible, setVisible] = useState(true);
  const [value, setValue] = useState(command.value);

  useOnUpdate(command, () => {
    setEnabled(command.isEnabled);
    setVisible(command.isVisible);
    if (command instanceof BaseSliderCommand) {
      setValue(command.value);
    }
  });
  // @end

  if (!isVisible) {
    return null;
  }
  const label = command.getLabel(t) + ': ' + command.getValueLabel();

  return (
    <SliderDiv>
      <label>{label}</label>
      <StyledSlider
        disabled={!isEnabled}
        min={command.min}
        max={command.max}
        step={command.step}
        marks={command.marks}
        onChange={(value: number) => {
          command.value = value;
          setValue(value);
        }}
        value={value}
      />
    </SliderDiv>
  );
}

function DropdownButtonComponent({ command }: { command: BaseOptionCommand }): ReactNode {
  // @update-ui-component-pattern
  const [isVisible, setVisible] = useState(true);

  useOnUpdate(command, () => {
    setVisible(command.isVisible);
  });
  // @end

  if (!isVisible) {
    return null;
  }

  return <DropdownButton inputCommand={command} placement={'bottom'} usedInSettings={true} />;
}

function SegmentedButtonComponent({ command }: { command: BaseOptionCommand }): ReactNode {
  const [isVisible, setVisible] = useState(true);

  useOnUpdate(command, () => {
    setVisible(command.isVisible);
  });

  if (!isVisible) {
    return null;
  }

  return <SegmentedButtons inputCommand={command} placement={'bottom'} />;
}

function FilterButtonComponent({ command }: { command: BaseFilterCommand }): ReactNode {
  command.initializeChildrenIfNeeded();

  // @update-ui-component-pattern
  const [isVisible, setVisible] = useState(true);

  useOnUpdate(command, () => {
    setVisible(command.isVisible);
  });
  // @end

  if (!isVisible) {
    return null;
  }
  return <FilterButton inputCommand={command} placement={'bottom'} usedInSettings={true} />;
}

const SliderDiv = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: start;
  justify-content: space-between;
  gap: 4px;
  font-size: 14px;
`;

const StyledSlider = styled(Slider)`
  offset-anchor: right top;
  float: center;
  display: flex;
  margin: 0px 4px;
  height: 40px;
  align-self: stretch;
`;

const StyledSectionHeader = styled.span`
  color: var(--text-icon-muted, rgba(0, 0, 0, 0.55));
  font-feature-settings: 'cv05' on;

  /* Label/XSmall */
  font-family: Inter;
  font-size: 12px;
  font-style: normal;
  font-weight: 500;
  line-height: 20px; /* 166.667% */
  letter-spacing: -0.036px;
`;

const StyledToggleContainer = styled(Flex).attrs({
  direction: 'row'
})`
  width: 100%;
  justify-content: start;
  gap: 8px;
`;

const StyledMenuPanel = styled.div`
  max-height: 400px;
  min-width: 340px;
  overflow-x: hidden;
  overflow-y: auto;

  display: flex;
  padding: var(--Padding-Small-Small-8, 8px) var(--space-8, 8px);
  flex-direction: column;
  align-items: flex-start;
  gap: var(--Padding-Small-Small-8, 8px);

  border-radius: var(--Radius-Large, 8px);
  background: #fff;

  box-shadow:
    0px 1px 16px 4px rgba(79, 82, 104, 0.1),
    0px 1px 8px 0px rgba(79, 82, 104, 0.08),
    0px 1px 2px 0px rgba(79, 82, 104, 0.24);
`;

const StyledMenuHeader = styled.span`
  flex: 1 0 0;

  color: var(--color-text-icon-strong, rgba(0, 0, 0, 0.9));

  /* Body/Medium strong */
  font-family: var(--typography-font-family-default, Inter);
  font-size: var(--typography-body-medium-strong-size, 14px);
  font-style: normal;
  font-weight: 500;
  line-height: var(--typography-body-medium-strong-line-height, 20px); /* 142.857% */
  letter-spacing: var(--typography-body-medium-strong-letter-spacing, -0.084px);
`;
