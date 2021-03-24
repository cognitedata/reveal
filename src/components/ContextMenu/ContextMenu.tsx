import { Button, Dropdown, Menu, Tooltip } from '@cognite/cogs.js';
import React, { useState } from 'react';
import { ChartTimeSeries, ChartWorkflow } from 'reducers/charts/types';
import styled from 'styled-components/macro';

type ContextMenuProps = {
  sourceItem: ChartWorkflow | ChartTimeSeries | undefined;
  onClose: () => void;
  visible?: boolean;
};

const menuOptions = [
  {
    value: 'metadata',
    label: 'Metadata',
  },
  {
    value: 'statistics',
    label: 'Statistics',
  },
];

export const ContextMenu = ({
  visible,
  sourceItem,
  onClose,
}: ContextMenuProps) => {
  const [selectedMenu, setSelectedMenu] = useState<string>('metadata');
  const [showDropdown, setShowDropdown] = useState<boolean>(false);

  const handleMenuClick = (value: string) => {
    setSelectedMenu(value);
    setShowDropdown(false);
  };

  return (
    <Sidebar visible={visible}>
      <TopContainer>
        <div>
          <Tooltip content="Hide">
            <Button icon="Close" variant="ghost" onClick={onClose} />
          </Tooltip>
        </div>

        <div>
          <Dropdown
            visible={showDropdown}
            onClickOutside={() => setShowDropdown(false)}
            content={
              <Menu>
                {menuOptions.map(({ value, label }) => (
                  <Menu.Item key={value} onClick={() => handleMenuClick(value)}>
                    {label}
                  </Menu.Item>
                ))}
              </Menu>
            }
          >
            <Button
              onClick={() => setShowDropdown(!showDropdown)}
              icon="Down"
              iconPlacement="right"
            >
              {menuOptions.find(({ value }) => value === selectedMenu)?.label}
            </Button>
          </Dropdown>
        </div>
      </TopContainer>

      {selectedMenu === 'metadata' && <Metadata sourceItem={sourceItem} />}
      {selectedMenu === 'statistics' && <Statistics sourceItem={sourceItem} />}
    </Sidebar>
  );
};

const Metadata = ({
  sourceItem,
}: {
  sourceItem: ChartWorkflow | ChartTimeSeries | undefined;
}) => {
  return (
    <Container>
      <h3>Name:</h3>
      <p>{sourceItem?.name}</p>
      <h3>Color:</h3>
      <p>
        <ColorCircle color={sourceItem?.color} />
      </p>
      <h3>Line style:</h3>
      <p>{sourceItem?.lineStyle}</p>
      <h3>Line weight:</h3>
      <p>{sourceItem?.lineWeight}</p>
    </Container>
  );
};

const Statistics = ({
  sourceItem,
}: {
  sourceItem: ChartWorkflow | ChartTimeSeries | undefined;
}) => {
  return (
    <Container>
      <h3>Name:</h3>
      <p>{sourceItem?.name}</p>
      <h3>Average:</h3>
      <p>?</p>
      <h3>Min:</h3>
      <p>?</p>
      <h3>Max:</h3>
      <p>?</p>
      <h3>Mean:</h3>
      <p>?</p>
      <h3>Standard deviation:</h3>
      <p>?</p>
    </Container>
  );
};

const TopContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ColorCircle = styled.span`
  display: inline-block;
  background-color: ${(props) => props.color};
  width: 20px;
  height: 20px;
`;

const Sidebar = styled.div<{ visible?: boolean }>`
  border-left: 1px solid var(--cogs-greyscale-grey4);
  width: ${(props) => (props.visible ? '400px' : 0)};
  transition: visibility 0s linear 200ms, width 200ms ease;
`;

const Container = styled.div`
  padding: 20px;
`;
