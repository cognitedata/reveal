import React from 'react';
import { ExplorerPropType } from '../../../UserInterface/Components/Explorer/ExplorerTypes';
import { ExplorerTabs } from '../../../UserInterface/Components/Explorer/ExplorerTabs';
import { VirtualTree } from '../../../UserInterface/Components/VirtualTree/VirtualTree';
import styled from 'styled-components';
import { PersistState } from './PersistState';
// Renders Tree Controller
export const Explorer = (props: ExplorerPropType) => {
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
      <PersistState props={props}>
        {(onToggleNode: (uniqueId: string) => void) => {
          return (
            <>
              <ExplorerTabs
                tabs={props.tabs}
                selectedTabIndex={props.selectedTabIndex}
                onTabChange={props.onTabChange}
              />
              <VirtualTree
                data={props.data}
                onToggleNodeSelect={handleToggleNodeSelect}
                onToggleNodeExpand={handleToggleNodeExpand}
                onToggleNodeCheck={onToggleNode}
              />
            </>
          );
        }}
      </PersistState>
    </ExplorerWrapper>
  );
};

const ExplorerWrapper = styled.div`
  height: 100%;
  margin: 0;
  display: flex;
  flex-direction: column;
`;
