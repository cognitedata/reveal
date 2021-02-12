import TreeView, {
  NodesTreeViewRefType,
} from 'src/pages/RevisionDetails/components/TreeView/NodesTreeView';
import React, { useEffect, useRef, useState } from 'react';
import {
  TreeDataNode,
  TreeLoadMoreNode,
} from 'src/pages/RevisionDetails/components/TreeView/types';
import { Cognite3DModel, Cognite3DViewer } from '@cognite/reveal';
import { fireErrorNotification, logToSentry } from 'src/utils';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from 'src/store';
import {
  checkNodes,
  expandNodes,
  fetchInitialNodes,
  loadNodeChildren,
  loadSiblings,
  resetTreeViewState,
  SelectedNode,
  selectNodes,
  TreeIndex,
  TreeViewState,
} from 'src/store/modules/TreeView';
import Spinner from 'src/components/Spinner';
import styled from 'styled-components';
import { treeViewFocusContainerId } from 'src/pages/RevisionDetails/components/ToolbarTreeView/treeViewFocusContainerId';
import { NodeInfoModal } from './NodeInfoModal';

import { useResizeHandler } from './hooks/useResizeHander';
import { useSelectedNodesHighlights } from './hooks/useSelectedNodesHighlights';
import { useCheckedNodesVisibility } from './hooks/useCheckedNodesVisibility';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  overflow-y: hidden;
`;

type TreeViewWrapperProps = {
  model: Cognite3DModel;
  width: number;
  height: number;

  onNodeInfoRequested: (treeIndex: number) => void;

  viewer: Cognite3DViewer;
};

function ToolbarTreeViewComponent(props: TreeViewWrapperProps) {
  const treeViewRef = useRef<NodesTreeViewRefType>(null);

  const { modelId, revisionId } = props.model;
  const state: TreeViewState = useSelector(
    ({ treeView }: RootState) => treeView
  );
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchInitialNodes(modelId, revisionId));
    return () => {
      dispatch(resetTreeViewState());
    };
  }, [modelId, revisionId, dispatch]);

  useEffect(() => {
    if (state.error) {
      fireErrorNotification({
        message: state.error.message,
      });
    }
  }, [state.error]);

  useSelectedNodesHighlights({
    viewer: props.viewer,
    model: props.model,
    treeViewRef,
  });

  useCheckedNodesVisibility(props.viewer, props.model, state.checkedNodes);

  const loadChildren = async (treeNode: TreeDataNode): Promise<void> => {
    if (treeNode.children && treeNode.children.length) {
      return;
    }

    dispatch(
      loadNodeChildren({
        parent: {
          nodeId: treeNode.meta.id,
          treeIndex: treeNode.key,
        },
      })
    );
  };

  const loadMoreClicked = ({ key, cursor, parent }: TreeLoadMoreNode) => {
    dispatch(
      loadSiblings({
        cursor,
        cursorKey: key,
        parent,
      })
    );
  };

  const nodeChecked = (checkedKeys: Array<TreeIndex>) => {
    dispatch(checkNodes(checkedKeys));
  };

  const nodeExpanded = (expandedKeys: Array<number>) => {
    dispatch(expandNodes(expandedKeys));
  };

  const nodeSelected = (selectedKeys: Array<SelectedNode>) => {
    dispatch(selectNodes(selectedKeys));
  };

  const nodeInfoRequested = (treeIndex: number) => {
    props.onNodeInfoRequested(treeIndex);
  };

  if (state.loading) {
    return <Spinner />;
  }
  if (state.error) {
    logToSentry(state.error);
    return <p>{state.error.message}</p>;
  }
  return (
    <TreeView
      ref={treeViewRef}
      treeData={state.treeData}
      checkedKeys={state.checkedNodes}
      expandedKeys={state.expandedNodes}
      selectedNodes={state.selectedNodes}
      loadChildren={loadChildren}
      loadSiblings={loadMoreClicked}
      onCheck={nodeChecked}
      onExpand={nodeExpanded}
      onSelect={nodeSelected}
      onNodeInfoRequest={nodeInfoRequested}
      height={props.height}
      width={props.width}
    />
  );
}

type ToolbarTreeViewProps = { style?: React.CSSProperties } & Omit<
  TreeViewWrapperProps,
  'height' | 'onNodeInfoRequested'
>;

export function ToolbarTreeView({ style, ...restProps }: ToolbarTreeViewProps) {
  const treeViewContainer = useRef<HTMLDivElement>(null);
  const { height: treeViewHeight } = useResizeHandler(treeViewContainer);

  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const [nodeInfoTreeIndex, setNodeInfoTreeIndex] = useState<
    number | undefined
  >(undefined);

  return (
    <Container>
      <Container
        style={style}
        ref={treeViewContainer}
        id={treeViewFocusContainerId}
        tabIndex={
          -1 /* antd Tree doesn't support keyboard handling, focus, tabindex, that's why it's done here */
        }
      >
        <ToolbarTreeViewComponent
          {...restProps}
          height={treeViewHeight}
          onNodeInfoRequested={(treeIndex) => {
            setNodeInfoTreeIndex(treeIndex);
            setInfoModalOpen(true);
          }}
        />
      </Container>
      <NodeInfoModal
        treeIndex={nodeInfoTreeIndex}
        onClose={() => setInfoModalOpen(false)}
        visible={infoModalOpen}
      />
    </Container>
  );
}
