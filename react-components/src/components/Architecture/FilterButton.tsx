/*!
 * Copyright 2024 Cognite AS
 */

import {
  useMemo,
  useState,
  type ReactElement,
  type MouseEvent,
  type Dispatch,
  type SetStateAction
} from 'react';
import { Button, ChevronDownIcon, ChevronUpIcon, Tooltip as CogsTooltip } from '@cognite/cogs.js';
import { Menu, SelectPanel } from '@cognite/cogs-lab';
import { useTranslation } from '../i18n/I18n';
import { useRenderTarget } from '../RevealCanvas/ViewerContext';
import { getButtonType, getDefaultCommand, getTooltipPlacement } from './utilities';
import { LabelWithShortcut } from './LabelWithShortcut';
import { BaseFilterCommand } from '../../architecture/base/commands/BaseFilterCommand';
import { FilterItem } from './FilterItem';
import { OPTION_MIN_WIDTH, DEFAULT_PADDING, SELECT_DROPDOWN_ICON_COLOR } from './constants';
import { type IconName } from '../../architecture/base/utilities/IconName';
import { IconComponent } from './Factories/IconFactory';
import { TOOLBAR_HORIZONTAL_PANEL_OFFSET } from '../constants';

import { offset } from '@floating-ui/dom';
import styled from 'styled-components';
import { type PlacementType } from './types';
import { useOnUpdate } from './useOnUpdate';

export const FilterButton = ({
  inputCommand,
  placement,
  usedInSettings = false
}: {
  inputCommand: BaseFilterCommand;
  placement: PlacementType;
  usedInSettings?: boolean;
}): ReactElement => {
  const renderTarget = useRenderTarget();
  const command = useMemo<BaseFilterCommand>(
    () => getDefaultCommand<BaseFilterCommand>(inputCommand, renderTarget),
    []
  );

  command.initializeChildrenIfNeeded();

  // @update-ui-component-pattern
  const [isEnabled, setEnabled] = useState(true);
  const [isVisible, setVisible] = useState(true);
  const [uniqueId, setUniqueId] = useState(0);
  const [icon, setIcon] = useState<IconName>(undefined);
  const [isOpen, setOpen] = useState(false);
  const [isAllChecked, setAllChecked] = useState(false);
  const [isSomeChecked, setSomeChecked] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState('');

  const { t } = useTranslation();
  const label = command.getLabel(t);

  useOnUpdate(command, () => {
    setEnabled(command.isEnabled);
    setVisible(command.isVisible);
    setUniqueId(command.uniqueId);
    setIcon(command.icon);
    if (command instanceof BaseFilterCommand) {
      setAllChecked(command.isAllChecked);
      setSomeChecked(command.children?.some((child) => child.isChecked) === true);
      setSelectedLabel(command.getSelectedLabel(t));
    }
  });
  // @end

  const children = command.children;
  if (!isVisible || children === undefined || children.length === 0) {
    return <></>;
  }
  const PanelContent = (
    <FilterSelectPanelContent
      command={command}
      isAllChecked={isAllChecked}
      isSomeChecked={isSomeChecked}
      label={label}
    />
  );

  return usedInSettings ? (
    <FilterDropdown
      label={label}
      selectedLabel={selectedLabel}
      isOpen={isOpen}
      setOpen={setOpen}
      PanelContent={PanelContent}
    />
  ) : (
    <FilterMenu
      command={command}
      placement={getTooltipPlacement(placement)}
      iconName={icon}
      label={label}
      isOpen={isOpen}
      setOpen={setOpen}
      isEnabled={isEnabled}
      uniqueId={uniqueId}
      PanelContent={PanelContent}
    />
  );
};

const FilterMenu = ({
  command,
  isOpen,
  setOpen,
  label,
  isEnabled,
  placement,
  iconName,
  uniqueId,
  PanelContent
}: {
  command: BaseFilterCommand;
  isOpen: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  label: string;
  isEnabled: boolean;
  placement: PlacementType;
  iconName: IconName;
  uniqueId: number;
  PanelContent: ReactElement;
}): ReactElement => {
  const { t } = useTranslation();

  return (
    <Menu
      floatingProps={{ middleware: [offset(TOOLBAR_HORIZONTAL_PANEL_OFFSET)] }}
      onOpenChange={setOpen}
      placement={'right-end'}
      disableCloseOnClickInside
      renderTrigger={(props: any) => (
        <CogsTooltip
          content={<LabelWithShortcut label={label} command={command} />}
          disabled={isOpen || label === undefined}
          placement={placement}>
          <Button
            type={getButtonType(command)}
            icon={<IconComponent iconName={iconName} />}
            key={uniqueId}
            disabled={!isEnabled}
            toggled={isOpen}
            iconPlacement="left"
            aria-label={command.getLabel(t)}
            {...props}
            onClick={(event: MouseEvent<HTMLElement>) => {
              event.stopPropagation();
              event.preventDefault();
              props.onClick(event);
              setOpen(!isOpen);
            }}
          />
        </CogsTooltip>
      )}>
      {PanelContent}
    </Menu>
  );
};

const FilterDropdown = ({
  label,
  selectedLabel,
  isOpen,
  setOpen,
  PanelContent
}: {
  label: string;
  selectedLabel: string;
  isOpen: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  PanelContent: ReactElement;
}): ReactElement => {
  return (
    <StyledDropdownRow>
      <label>{label}</label>
      <StyledSelectPanel appendTo={'parent'} placement={'right-end'} hideOnOutsideClick>
        <SelectPanel.Trigger>
          <Button
            color="#000044"
            type="tertiary"
            style={{
              justifyContent: 'space-between',
              minWidth: OPTION_MIN_WIDTH,
              paddingRight: '8px',
              paddingLeft: '8px'
            }}
            onClick={() => {
              setOpen((prev) => !prev);
            }}>
            <StyledDropdownSelectionLabel>{selectedLabel}</StyledDropdownSelectionLabel>
            {isOpen ? (
              <ChevronUpIcon color={SELECT_DROPDOWN_ICON_COLOR} />
            ) : (
              <ChevronDownIcon color={SELECT_DROPDOWN_ICON_COLOR} />
            )}
          </Button>
        </SelectPanel.Trigger>
        <SelectPanel.Body style={{ overflow: 'hidden' }}>{PanelContent}</SelectPanel.Body>
      </StyledSelectPanel>
    </StyledDropdownRow>
  );
};

const FilterSelectPanelContent = ({
  command,
  isAllChecked,
  isSomeChecked,
  label
}: {
  command: BaseFilterCommand;
  label: string;
  isAllChecked: boolean;
  isSomeChecked: boolean;
}): ReactElement => {
  const { t } = useTranslation();

  const children = command.children;

  return (
    <>
      <SelectPanel.Section>
        <SelectPanel.Item
          key={-1}
          variant="checkbox"
          checked={isAllChecked}
          indeterminate={!isAllChecked && isSomeChecked}
          onClick={() => {
            command.toggleAllChecked();
          }}
          label={BaseFilterCommand.getAllString(t)}>
          {BaseFilterCommand.getAllString(t)}
        </SelectPanel.Item>
      </SelectPanel.Section>
      <SelectPanel.Body style={{ maxHeight: '300px' }}>
        <SelectPanel.Section title={label}>
          {children?.map((child, _index): ReactElement => {
            return <FilterItem key={child.uniqueId} command={child} />;
          })}
        </SelectPanel.Section>
      </SelectPanel.Body>
    </>
  );
};

const StyledDropdownRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  padding: ${DEFAULT_PADDING};
`;

const StyledSelectPanel = styled(SelectPanel)`
  display: flex;
  display-direction: row;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
`;

const StyledDropdownSelectionLabel = styled.label`
  font-weight: 400;
`;
