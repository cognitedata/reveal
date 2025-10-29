import { BannerComponent } from './BannerComponent';
import { BaseBannerCommand, GroupCommand } from '../../architecture';
import { useTranslation } from '../i18n/I18n';
import { BaseFilterCommand } from '../../architecture/base/commands/BaseFilterCommand';
import { BaseOptionCommand } from '../../architecture/base/commands/BaseOptionCommand';
import { BaseSliderCommand } from '../../architecture/base/commands/BaseSliderCommand';
import {
  Button,
  Tooltip as CogsTooltip,
  Flex,
  Slider,
  Switch,
  Accordion,
  WarningFilledIcon,
  Body
} from '@cognite/cogs.js';
import { DEFAULT_PADDING, TOOLTIP_DELAY } from './constants';
import { Dropdown, Menu } from '@cognite/cogs-lab';
import { DropdownButton } from './DropdownButton';
import { FilterButton } from './FilterButton';
import {
  getFlexDirection,
  getTooltipPlacement,
  getDropdownPlacement,
  DROP_DOWN_OFFSET
} from './utilities';
import { IconComponent } from './Factories/IconFactory';
import { LabelWithShortcut } from './LabelWithShortcut';
import { SectionCommand } from '../../architecture/base/commands/SectionCommand';
import { type BaseCommand } from '../../architecture/base/commands/BaseCommand';
import { BaseSettingsCommand } from '../../architecture/base/commands/BaseSettingsCommand';
import { type FlexDirection, type PlacementType } from './types';
import { type ReactNode, useState, type ReactElement } from 'react';
import { useCommand } from './hooks/useCommand';
import { useCommandVisible, useCommandProps, useSliderCommandValue } from './hooks/useCommandProps';
import styled from 'styled-components';
import { QualityWarningBannerCommand } from '../../architecture/base/concreteCommands/quality/QualityWarningBannerCommand';
import { SetLengthUnitCommand } from '../../architecture/base/concreteCommands/units/SetLengthUnitCommand';
import { SegmentedButtons } from './SegmentedButtons';

export function createSettingsButton(
  command: BaseCommand,
  placement: PlacementType
): ReactElement | undefined {
  if (command instanceof BaseSettingsCommand) {
    return <SettingsButton key={command.uniqueId} inputCommand={command} placement={placement} />;
  }
  return undefined;
}

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
          {command.children.map(createMenuItem)}
        </StyledMenuPanel>
      }
      onShow={(open) => {
        setOpen(open);
      }}
      onHide={(open) => {
        setOpen(open);
      }}
      placement={getDropdownPlacement(placement)}
      offset={DROP_DOWN_OFFSET}>
      <CogsTooltip
        content={<LabelWithShortcut label={label} command={command} />}
        disabled={isTooltipDisabled}
        enterDelay={TOOLTIP_DELAY}
        placement={getTooltipPlacement(placement)}>
        <Button
          type={command.buttonType}
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
  if (command instanceof BaseBannerCommand) {
    return <BannerComponent key={command.uniqueId} command={command} />;
  }
  if (command instanceof GroupCommand) {
    return <GroupComponent key={command.uniqueId} command={command} />;
  }
  return createGroupItem(command);
}

function createGroupItem(command: BaseCommand): ReactNode {
  if (command instanceof QualityWarningBannerCommand) {
    return <QualityWarningBannerComponent key={command.uniqueId} command={command} />;
  }
  if (command instanceof BaseSliderCommand) {
    return <SliderComponent key={command.uniqueId} command={command} />;
  }
  if (command instanceof SetLengthUnitCommand) {
    return (
      <SegmentedButtons
        key={command.uniqueId}
        inputCommand={command}
        placement="bottom"
        fullWidth
      />
    );
  }
  if (command instanceof BaseOptionCommand) {
    return <DropdownButtonComponent key={command.uniqueId} command={command} />;
  }
  if (command instanceof GroupCommand) {
    return <GroupComponent key={command.uniqueId} command={command} />;
  }
  if (command instanceof SectionCommand) {
    return <SectionComponent key={command.uniqueId} command={command} />;
  }
  if (command instanceof BaseFilterCommand) {
    return <FilterButtonComponent key={command.uniqueId} command={command} />;
  }
  if (command.isToggle) {
    return <ToggleComponent key={command.uniqueId} command={command} />;
  }
  return <ButtonComponent key={command.uniqueId} command={command} />;
}

function QualityWarningBannerComponent({
  command
}: {
  command: QualityWarningBannerCommand;
}): ReactNode {
  const { t } = useTranslation();
  const isVisible = useCommandVisible(command);
  if (!isVisible) {
    return null;
  }

  return (
    <StyledQualityWarningContainer
      title={command.tooltip !== undefined ? t(command.tooltip) : undefined}>
      <WarningFilledIcon />
      <Body strong size="x-small">
        {t(command.content)}
      </Body>
    </StyledQualityWarningContainer>
  );
}

function GroupComponent({ command }: { command: GroupCommand }): ReactNode {
  const { t } = useTranslation();
  const isGroupVisible = useCommandVisible(command);
  if (!isGroupVisible) {
    return null;
  }

  if (command.isAccordion) {
    return (
      <StyledAccordion
        expanded
        title={command.tooltip !== undefined ? t(command.tooltip) : undefined}>
        <StyledGroupContent>{command.commands.map(createGroupItem)}</StyledGroupContent>
      </StyledAccordion>
    );
  }
  return <StyledRowComponent>{command.commands.map(createGroupItem)}</StyledRowComponent>;
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
      <Body size="medium">{command.label}</Body>
    </StyledToggleContainer>
  );
}

function SectionComponent({ command }: { command: BaseCommand }): ReactNode {
  const isVisible = useCommandVisible(command);
  if (!isVisible) {
    return null;
  }

  return <Body size="medium">{command.label}</Body>;
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

const StyledQualityWarningContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--cogs-text-icon--status-warning);

  .cogs-typography {
    color: var(--cogs-text-icon--status-warning);
  }
`;

const StyledToggleContainer = styled(Flex).attrs({
  direction: 'row'
})`
  width: fit-content;
  justify-content: start;
  gap: 8px;
`;

const StyledMenuPanel = styled.div<{ $flexDirection: FlexDirection }>`
  max-height: 700px;
  min-width: 350px;
  max-width: 400px;
  overflow-x: hidden;
  overflow-y: auto;
  flexdirection: ${({ $flexDirection }) => $flexDirection};

  display: flex;
  padding: 12px;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;

  border-radius: var(--Radius-Large, 8px);
  background: #fff;

  box-shadow:
    0px 1px 16px 4px rgba(79, 82, 104, 0.1),
    0px 1px 8px 0px rgba(79, 82, 104, 0.08),
    0px 1px 2px 0px rgba(79, 82, 104, 0.24);
`;

const StyledAccordion = styled(Accordion)`
  .cogs-accordion__content {
    padding: 4px 12px 12px !important;
  }
`;

const StyledGroupContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const StyledRowComponent = styled.div`
  display: flex;
  gap: 12px;
`;
