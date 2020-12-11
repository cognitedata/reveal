import React from 'react';
import { ExplorerPropType } from '@/UserInterface/Components/Explorer/ExplorerTypes';
import { ExplorerTabs } from '@/UserInterface/Components/Explorer/ExplorerTabs';
import { VirtualTree } from '@/UserInterface/Components/VirtualTree/VirtualTree';
import styled from 'styled-components';

// Renders Tree Controller
export const Explorer = (props: ExplorerPropType) => {
  // Handle Node Check
  const handleToggleVisible = (uniqueId: string) => {
    props.onToggleVisible(uniqueId);
  };

  // Handle Node Expand
  const handleToggleNodeExpand = (uniqueId: string, expandState: boolean) => {
    props.onNodeExpandToggle(uniqueId, expandState);
  };

  // Handle Node Select
  const handleToggleNodeSelect = (uniqueId: string, selectState: boolean) => {
    props.onNodeSelect(uniqueId, selectState);
  };

  return (
    <ExplorerWrapper>
      <ExplorerTabs
        tabs={props.tabs}
        selectedTabIndex={props.selectedTabIndex}
        onTabChange={props.onTabChange}
      />
      <VirtualTree
        data={props.data}
        onToggleNodeSelect={handleToggleNodeSelect}
        onToggleNodeExpand={handleToggleNodeExpand}
        onToggleNodeCheck={handleToggleVisible}
      />
    </ExplorerWrapper>
  );
};

const ExplorerWrapper = styled.div`
  height: 100%;
  margin: 0;
  display: flex;
  flex-direction: column;
`;
