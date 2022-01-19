import React from 'react';
import { ExplorerTabsPropType } from '@/UserInterface/Components/Explorer/ExplorerTypes';
import styled from 'styled-components';
import { TabPane as Tab, Tabs } from '@cognite/cogs.js';

// Renders Explorer Tabs
export const ExplorerTabs = (props: ExplorerTabsPropType) => {
  const { onTabChange, tabs, selectedTabIndex } = props;
  if (!tabs) {
    return null;
  }
  const handleChange = (activeKey: string) => {
    onTabChange(Number(activeKey));
  };

  return (
    <StyledTabs activeKey={selectedTabIndex.toString()} onChange={handleChange}>
      {tabs.map((tab, index) => (
        <Tab key={index.toString()} tab={<span>{tab.name}</span>} />
      ))}
    </StyledTabs>
  );
};

export const StyledTabs = styled(Tabs)`
  min-height: 30px;
`;
