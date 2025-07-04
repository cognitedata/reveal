import {
  useState,
  type ReactElement,
  type MouseEvent,
  type Dispatch,
  type SetStateAction
} from 'react';
import {
  Button,
  ChevronDownIcon,
  ChevronUpIcon,
  Tooltip as CogsTooltip,
  Flex
} from '@cognite/cogs.js';
import { Menu, SelectPanel } from '@cognite/cogs-lab';
import { getButtonType, getTooltipPlacement } from './utilities';
import { LabelWithShortcut } from './LabelWithShortcut';
import { BaseFilterCommand } from '../../architecture/base/commands/BaseFilterCommand';
import { FilterItem } from './FilterItem';
import { DEFAULT_PADDING, SELECT_DROPDOWN_ICON_COLOR } from './constants';
import { type IconName } from '../../architecture/base/utilities/IconName';
import { IconComponent } from './Factories/IconFactory';
import { TOOLBAR_HORIZONTAL_PANEL_OFFSET } from '../constants';

import { offset } from '@floating-ui/dom';
import styled from 'styled-components';
import { type PlacementType } from './types';
import { useCommandProperty } from './hooks/useCommandProperty';
import { useCommand } from './hooks/useCommand';
import { useCommandProps } from './hooks/useCommandProps';

export const FilterButton = ({
  inputCommand,
  placement,
  usedInSettings = false
}: {
  inputCommand: BaseFilterCommand;
  placement: PlacementType;
  usedInSettings?: boolean;
}): ReactElement => {
  const command = useCommand(inputCommand);
  command.initializeChildrenIfNeeded();

  const { icon, isVisible, isEnabled } = useCommandProps(command);
  const isAllChecked = useCommandProperty(command, () => command.isAllChecked);
  const isSomeChecked = useCommandProperty(command, () => command.isSomeChecked);
  const selectedLabel = useCommandProperty(command, () => command.getSelectedLabel());
  const [isOpen, setOpen] = useState(false);

  const children = command.children;
  if (!isVisible || children === undefined || children.length === 0) {
    return <></>;
  }
  const PanelContent = (
    <FilterSelectPanelContent
      command={command}
      isAllChecked={isAllChecked}
      isSomeChecked={isSomeChecked}
      label={command.label}
    />
  );

  return usedInSettings ? (
    <FilterDropdown
      label={command.label}
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
      label={command.label}
      isOpen={isOpen}
      setOpen={setOpen}
      isEnabled={isEnabled}
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
  PanelContent
}: {
  command: BaseFilterCommand;
  isOpen: boolean;
  setOpen: Dispatch<SetStateAction<boolean>>;
  label: string;
  isEnabled: boolean;
  placement: PlacementType;
  iconName: IconName;
  PanelContent: ReactElement;
}): ReactElement => {
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
            disabled={!isEnabled}
            toggled={isOpen}
            iconPlacement="left"
            aria-label={command.label}
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
      <StyledLabel>{label}</StyledLabel>
      <StyledSelectPanel placement={'right-end'} visible={isOpen}>
        <SelectPanel.Trigger>
          <StyledSelectPanelButton
            color="#000044"
            type="tertiary"
            toggled={isOpen}
            onClick={() => {
              setOpen((prev) => !prev);
            }}>
            <StyledPanelButtonContent>
              <StyledDropdownSelectionLabel>{selectedLabel}</StyledDropdownSelectionLabel>
              {isOpen ? (
                <ChevronUpIcon color={SELECT_DROPDOWN_ICON_COLOR} />
              ) : (
                <ChevronDownIcon color={SELECT_DROPDOWN_ICON_COLOR} />
              )}
            </StyledPanelButtonContent>
          </StyledSelectPanelButton>
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
          label={BaseFilterCommand.getAllString()}>
          {BaseFilterCommand.getAllString()}
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
  align-self: stretch;
  flex-direction: row;
  justify-content: space-between;
  align-items: center;

  padding: ${DEFAULT_PADDING};
`;

const StyledLabel = styled.label`
  flex: 2 2;
`;

const StyledSelectPanelButton = styled(Button)`
  width: 100%;
  padding: 0px 0px;
`;

const StyledPanelButtonContent = styled(Flex).attrs({ direction: 'row' })`
  width: 100%;
  justify-content: space-between;
`;

const StyledSelectPanel = styled(SelectPanel)`
  display: flex;
  flex: 2 2;
  display-direction: row;
  justify-content: space-between;
  align-items: center;

  .cogs-v10.cogs-button {
    padding: 7px 8px;
  }

  .cogs-lab.cogs-dropdown__anchor-el {
    width: inherit;
  }
`;

const StyledDropdownSelectionLabel = styled.label`
  font-weight: 400;
`;
