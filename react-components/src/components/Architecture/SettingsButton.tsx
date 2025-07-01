import { BannerComponent } from './BannerComponent';
import { BaseBannerCommand } from '../../architecture';
import { BaseFilterCommand } from '../../architecture/base/commands/BaseFilterCommand';
import { BaseOptionCommand } from '../../architecture/base/commands/BaseOptionCommand';
import { BaseSliderCommand } from '../../architecture/base/commands/BaseSliderCommand';
import { Button, Tooltip as CogsTooltip, Flex, Slider, Switch, TextLabel } from '@cognite/cogs.js';
import { DEFAULT_PADDING, TOOLTIP_DELAY } from './constants';
import { DividerCommand } from '../../architecture/base/commands/DividerCommand';
import { Dropdown, Menu } from '@cognite/cogs-lab';
import { DropdownButton } from './DropdownButton';
import { FilterButton } from './FilterButton';
import { getButtonType, getFlexDirection, getTooltipPlacement } from './utilities';
import { IconComponent } from './Factories/IconFactory';
import { LabelWithShortcut } from './LabelWithShortcut';
import { SectionCommand } from '../../architecture/base/commands/SectionCommand';
import { TOOLBAR_HORIZONTAL_PANEL_OFFSET } from '../constants';
import { type BaseCommand } from '../../architecture/base/commands/BaseCommand';
import { type BaseSettingsCommand } from '../../architecture/base/commands/BaseSettingsCommand';
import { type FlexDirection, type PlacementType } from './types';
import { type ReactNode, useState, type ReactElement } from 'react';
import { useCommand } from './hooks/useCommand';
import { useCommandVisible, useCommandProps, useSliderCommandValue } from './hooks/useCommandProps';
import styled from 'styled-components';

export const SettingsButton = ({
  inputCommand,
  placement
}: {
  inputCommand: BaseSettingsCommand;
  placement: PlacementType;
}): ReactElement => {
  const command = useCommand(inputCommand);
  const { isVisible, isEnabled, icon } = useCommandProps(command);
  const [isOpen, setOpen] = useState(false);

  if (!isVisible || !command.hasChildren) {
    return <></>;
  }
  const label = command.label;
  const flexDirection = getFlexDirection(placement);
  const isTooltipDisabled = isOpen || label === undefined;

  return (
    <Dropdown
      disabled={!isEnabled}
      content={
        <StyledMenuPanel $flexDirection={flexDirection}>
          <StyledMenuHeader>{label}</StyledMenuHeader>
          {command.children.map((child) => createMenuItem(child))}
        </StyledMenuPanel>
      }
      onShow={(open) => {
        setOpen(open);
      }}
      onHide={(open) => {
        setOpen(open);
      }}
      placement={placement ?? 'right-end'}
      offset={{ mainAxis: TOOLBAR_HORIZONTAL_PANEL_OFFSET }}>
      <CogsTooltip
        content={<LabelWithShortcut label={label} command={command} />}
        disabled={isTooltipDisabled}
        enterDelay={TOOLTIP_DELAY}
        placement={getTooltipPlacement(placement)}>
        <Button
          type={getButtonType(command)}
          icon={<IconComponent iconName={icon} />}
          disabled={!isEnabled}
          toggled={isOpen}
          aria-label={label}
        />
      </CogsTooltip>
    </Dropdown>
  );
};

function createMenuItem(command: BaseCommand): ReactNode {
  if (command instanceof BaseSliderCommand) {
    return <SliderComponent key={command.uniqueId} command={command} />;
  }
  if (command instanceof BaseOptionCommand) {
    return <DropdownButtonComponent key={command.uniqueId} command={command} />;
  }
  if (command instanceof BaseFilterCommand) {
    return <FilterButtonComponent key={command.uniqueId} command={command} />;
  }
  if (command.isToggle) {
    return <ToggleComponent key={command.uniqueId} command={command} />;
  }
  if (command instanceof DividerCommand) {
    return <DividerComponent key={command.uniqueId} command={command} />;
  }
  if (command instanceof SectionCommand) {
    return <SectionComponent key={command.uniqueId} command={command} />;
  }
  if (command instanceof BaseBannerCommand) {
    return <BannerComponent key={command.uniqueId} command={command} />;
  }
  return <ButtonComponent key={command.uniqueId} command={command} />;
}

function DividerComponent({ command }: { command: BaseCommand }): ReactNode {
  const isVisible = useCommandVisible(command);
  if (!isVisible) {
    return null;
  }
  return <Menu.Divider />;
}

function SectionComponent({ command }: { command: BaseCommand }): ReactNode {
  const isVisible = useCommandVisible(command);
  if (!isVisible) {
    return null;
  }
  return <StyledSectionHeader>{command.label} </StyledSectionHeader>;
}

function ToggleComponent({ command }: { command: BaseCommand }): ReactNode {
  const { isVisible, isChecked, isEnabled } = useCommandProps(command);
  if (!isVisible) {
    return null;
  }
  return (
    <StyledToggleContainer
      onClick={() => {
        if (isEnabled) {
          command.invoke();
        }
      }}>
      <Switch checked={isChecked} disabled={!isEnabled} />
      <TextLabel text={command.label} />
    </StyledToggleContainer>
  );
}

function ButtonComponent({ command }: { command: BaseCommand }): ReactNode {
  const { isVisible, isEnabled, icon } = useCommandProps(command);
  if (!isVisible) {
    return null;
  }
  return (
    <Menu.ItemAction
      disabled={!isEnabled}
      icon={<IconComponent iconName={icon} />}
      style={{ padding: DEFAULT_PADDING }}
      shortcutKeys={command.getShortCutKeys()}
      label={command.label}
      onClick={() => {
        command.invoke();
      }}
    />
  );
}

function SliderComponent({ command }: { command: BaseSliderCommand }): ReactNode {
  const { isVisible, isEnabled } = useCommandProps(command);
  const value = useSliderCommandValue(command);
  if (!isVisible) {
    return null;
  }
  const label = command.label + ': ' + command.getValueLabel();

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
          command.update();
        }}
        value={value}
      />
    </SliderDiv>
  );
}

function DropdownButtonComponent({ command }: { command: BaseOptionCommand }): ReactNode {
  const isVisible = useCommandVisible(command);
  if (!isVisible) {
    return null;
  }
  return <DropdownButton inputCommand={command} placement={'bottom'} usedInSettings={true} />;
}

function FilterButtonComponent({ command }: { command: BaseFilterCommand }): ReactNode {
  command.initializeChildrenIfNeeded();
  const isVisible = useCommandVisible(command);
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

  justify-content: space-around;
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

const StyledMenuPanel = styled.div<{ $flexDirection: FlexDirection }>`
  max-height: 400px;
  min-width: 340px;
  overflow-x: hidden;
  overflow-y: auto;
  flexdirection: ${({ $flexDirection }) => $flexDirection};

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

const StyledMenuHeader = styled(Flex).attrs({
  direction: 'row'
})`
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
