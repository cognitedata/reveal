import React from 'react';
import { ExplorerTabsPropType } from '../../../UserInterface/Components/Explorer/ExplorerTypes';
import styled from 'styled-components';
import { Tabs } from '@cognite/cogs.js';

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
    <StyledTabs
      defaultActiveKey={selectedTabIndex.toString()}
      activeKey={selectedTabIndex.toString()}
      onChange={handleChange}
    >
      {tabs.map((tab, index) => (
        // tabs implementation has selectedIndex as activeKey, hence we've to use index as key for TabPane
        // handleChange accepts the key from TabPane
        // eslint-disable-next-line react/no-array-index-key
        <Tabs.TabPane key={index.toString()} tab={<span>{tab.name}</span>} />
      ))}
    </StyledTabs>
  );
};

export const StyledTabs = styled(Tabs)`
  min-height: 30px;
`;
