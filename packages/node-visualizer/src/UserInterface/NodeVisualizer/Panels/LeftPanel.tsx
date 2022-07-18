import React, { useMemo } from 'react';
import { connect } from 'react-redux';
import SplitPane from 'react-split-pane';

import styled from 'styled-components';

import { Dispatch } from 'redux';

import { ExplorerPropType } from '../../Components/Explorer/ExplorerTypes';
import {
  getAllTabs,
  getCurrentTabIndex,
  getNodeTree,
  onSelectedTabChange,
} from '../../Redux/reducers/ExplorerReducer';
import { onSelectedNodeChange } from '../../Redux/reducers/SettingsReducer';
import { State } from '../../Redux/State/State';
import { panelBackground } from '../../styles/styled.props';
import { ExplorerNodeUtils } from '../Explorer/ExplorerNodeUtils';
import { ConnectedSettingsPanel } from '../Settings/ConnectedSettingsPanel';

function mapDispatchToExplorerPanel(dispatch: Dispatch) {
  return {
    onTabChange: (tabIndex: number): void => {
      dispatch(onSelectedTabChange({ selectedTabIndex: tabIndex }));
      const currentSelectedNode =
        ExplorerNodeUtils.getSelectedNodeOfCurrentTab(tabIndex);
      if (currentSelectedNode)
        dispatch(onSelectedNodeChange(currentSelectedNode));
    },
    onNodeExpandToggle: (nodeId: string, expandState: boolean): void => {
      ExplorerNodeUtils.setNodeExpandById(nodeId, expandState);
    },
    onToggleVisible: (nodeId: string): void => {
      ExplorerNodeUtils.toggleVisibleById(nodeId);
    },
    onNodeSelect: (nodeId: string, selectState: boolean): void => {
      ExplorerNodeUtils.selectNodeById(nodeId, selectState);
    },
  };
}

function mapStateToExplorerPanel(state: State) {
  const tabs = getAllTabs(state);
  const data = getNodeTree(state);
  const selectedTabIndex = getCurrentTabIndex(state);

  return { tabs, data, selectedTabIndex };
}

interface LeftPanelProps {
  explorer: React.ComponentType<ExplorerPropType>;
  custom?: boolean;
}

const CustomSplitPane: any = SplitPane;

// Renders Explorer
export const LeftPanel = ({ explorer, custom }: LeftPanelProps) => {
  const Explorer = useMemo(
    () =>
      connect(mapStateToExplorerPanel, mapDispatchToExplorerPanel)(explorer),
    []
  );

  return (
    <LeftPanelContainer>
      {custom ? (
        <Explorer />
      ) : (
        <CustomSplitPane split="horizontal" defaultSize="50%" primary="second">
          <Explorer />
          <ConnectedSettingsPanel />
        </CustomSplitPane>
      )}
    </LeftPanelContainer>
  );
};

const LeftPanelContainer = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: var(--node-viz-background, ${panelBackground});
`;
