import React from 'react';

import styled from 'styled-components/macro';
import layers from 'utils/zindex';

import { Icon, Flex, Tooltip, Button, Dropdown, Menu } from '@cognite/cogs.js';
import {
  IToolbarButton,
  VisualizerToolbarProps,
  ToolbarButtonClickHandler,
  ToolbarSelectChangeHandler,
} from '@cognite/node-visualizer';

const Container = styled(Flex)`
  background-color: #fff;
  padding: 10px;
  position: absolute;
  width: 100%;
  z-index: ${layers.MAIN_LAYER};
  gap: 18px;
`;

const Item = styled.div`
  margin: 0;
  box-sizing: border-box;
`;

interface Handlers {
  onToolbarButtonClick: ToolbarButtonClickHandler;
  onToolbarSelectionChange: ToolbarSelectChangeHandler;
}

const getIcon = (id: string): JSX.Element => {
  const mapping: { [id: string]: JSX.Element } = {
    tools0: <Icon type="Grab" />,
    tools1: <Icon type="Edit" />,
    // tools2: <Icon type="ResizeWidth" />, TODO(PP-2548)
    tools2: <Icon type="ZoomIn" />,
    tools3: <Icon type="Ruler" />,

    actions0: <Icon type="Image" />,
    actions1: <Icon type="Axis3D" />,
    actions2: <Icon type="XAxis3D" />,
    actions3: <Icon type="Copy" />,
    actions4: <Icon type="Sun" />,
    actions5: <Icon type="FullScreen" />,
    actions6: <Icon type="Axis" />,

    viewfrom0: <Icon type="CubeTop" />,
    viewfrom1: <Icon type="CubeBottom" />,
    viewfrom2: <Icon type="CubeBackLeft" />,
    viewfrom3: <Icon type="CubeBackRight" />,
    viewfrom4: <Icon type="CubeFrontLeft" />,
    viewfrom5: <Icon type="CubeFrontRight" />,
  };
  const key = id.toLowerCase();

  return mapping[key] || <Icon type="HelpFilled" />;
};
const getIconId = (groupId: string, index: number): string =>
  `${groupId}${index}`;

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
      const selectHandler = (event: any) =>
        onToolbarSelectionChange(visualizerId, groupId, index, event);

      if (!isVisible) return null;

      return (
        <Item key={key}>
          <Tooltip content={tooltip}>
            {isDropdown
              ? renderDropdown(button, selectHandler)
              : renderIcon(key, button, buttonHandler)}
          </Tooltip>
        </Item>
      );
    })
    .filter(Boolean);
};

const renderDropdown = (
  { value, dropdownOptions }: IToolbarButton,
  handler: (event: any) => void
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
    <Container>
      {config &&
        Object.keys(config).map((groupId) => (
          <Flex key={groupId} wrap="wrap" gap={4} style={{ width: '25%' }}>
            {renderGroup(visualizerId, groupId, config[groupId], {
              onToolbarButtonClick,
              onToolbarSelectionChange,
            })}
          </Flex>
        ))}
    </Container>
  );
};
