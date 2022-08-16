import React from 'react';

import get from 'lodash/get';

import { Icon, Flex, Tooltip, Button, Dropdown, Menu } from '@cognite/cogs.js';
import {
  IToolbarButton,
  VisualizerToolbarProps,
  ToolbarButtonClickHandler,
  ToolbarSelectChangeHandler,
} from '@cognite/node-visualizer';

import { TOOLBAR_ICONS } from './constants';
import { ToolbarContainer, ToolbarItem } from './elements';

interface Handlers {
  onToolbarButtonClick: ToolbarButtonClickHandler;
  onToolbarSelectionChange: ToolbarSelectChangeHandler;
}

const getIcon = (id: string): JSX.Element => {
  const key = id.toLowerCase();
  return <Icon type={get(TOOLBAR_ICONS, key, 'HelpFilled')} />;
};
const getIconId = (groupId: string, index: number): string =>
  `${groupId}${index}`;

const getButtonTestId = (
  visualizerId: string,
  groupId: string,
  button: IToolbarButton
) => {
  const { tooltip } = button;

  /**
   * Check if tooltip contains `\n`.
   * If contains, take the first part of the tooltip. Otherwise, take the full text.
   */
  const tooltipNewLineIndex = tooltip.indexOf('\n');
  const tooltipActionKeyPoint =
    tooltipNewLineIndex > 0
      ? tooltip.substring(0, tooltipNewLineIndex)
      : tooltip;
  const tooltipStringForTestId = tooltipActionKeyPoint.replace(/\s+/g, '-');

  const testIdString = `${visualizerId}-${groupId}-${tooltipStringForTestId}`;
  return testIdString.toLowerCase();
};

const renderGroup = (
  visualizerId: string,
  groupId: string,
  buttons: IToolbarButton[],
  { onToolbarButtonClick, onToolbarSelectionChange }: Handlers
) => {
  return buttons
    .map((button, index) => {
      const { tooltip, isDropdown, isVisible } = button;
      const key = getIconId(groupId, index);
      const buttonHandler = () =>
        onToolbarButtonClick(visualizerId, groupId, index);
      const selectHandler = (event: string) =>
        onToolbarSelectionChange(visualizerId, groupId, index, event);

      if (!isVisible) {
        return null;
      }

      const testId = getButtonTestId(visualizerId, groupId, button);

      return (
        <ToolbarItem key={key} data-testid={testId}>
          <Tooltip content={tooltip}>
            {isDropdown
              ? renderDropdown(button, selectHandler)
              : renderIcon(key, button, buttonHandler)}
          </Tooltip>
        </ToolbarItem>
      );
    })
    .filter(Boolean);
};

const renderDropdown = (
  { value, dropdownOptions }: IToolbarButton,
  handler: (event: string) => void
) => {
  return (
    <Dropdown
      content={
        <Menu>
          {dropdownOptions.map((dropdown: string) => (
            <Menu.Item key={dropdown} onClick={() => handler(dropdown)}>
              {dropdown}
            </Menu.Item>
          ))}
        </Menu>
      }
    >
      <Button type="tertiary" iconPlacement="right">
        {value}
      </Button>
    </Dropdown>
  );
};

const renderIcon = (
  id: string,
  { isChecked }: IToolbarButton,
  handler: () => void
) => {
  return (
    <Button onClick={handler} type={isChecked ? 'primary' : 'secondary'}>
      {getIcon(id)}
    </Button>
  );
};

export const Toolbar: React.FC<VisualizerToolbarProps> = ({
  visualizerId,
  config,
  onToolbarButtonClick,
  onToolbarSelectionChange,
}: VisualizerToolbarProps) => {
  return (
    <ToolbarContainer>
      {config &&
        Object.keys(config).map((groupId) => (
          <Flex key={groupId} wrap="wrap" gap={4} style={{ width: '25%' }}>
            {renderGroup(visualizerId, groupId, config[groupId], {
              onToolbarButtonClick,
              onToolbarSelectionChange,
            })}
          </Flex>
        ))}
    </ToolbarContainer>
  );
};
