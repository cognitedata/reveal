import TreeView, {
  NodesTreeViewRefType,
} from 'src/pages/RevisionDetails/components/TreeView/NodesTreeView';
import React, { useEffect, useRef } from 'react';
import {
  EventLoadChildren,
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
  SelectedNode,
  selectNodes,
  TreeIndex,
  TreeViewState,
} from 'src/store/modules/TreeView';
import Spinner from 'src/components/Spinner';
import styled from 'styled-components';
import { useResizeHandler } from 'src/pages/RevisionDetails/components/ToolbarTreeView/hooks/useResizeHander';
import { useSelectedNodesHighlights } from 'src/pages/RevisionDetails/components/ToolbarTreeView/hooks/useSelectedNodesHighlights';
import { useCheckedNodesVisibility } from 'src/pages/RevisionDetails/components/ToolbarTreeView/hooks/useCheckedNodesVisibility';

const Container = styled.div`
  flex-grow: 1;
  overflow-y: hidden;
`;

type Props = {
  model: Cognite3DModel;
  width: number;
  height: number;

  viewer: Cognite3DViewer;
};

function ToolbarTreeViewComponent(props: Props) {
  const treeViewRef = useRef<NodesTreeViewRefType>(null);

  const { modelId, revisionId } = props.model;
  const state: TreeViewState = useSelector(
    ({ treeView }: RootState) => treeView
  );
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchInitialNodes(modelId, revisionId));
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

  const loadChildren = async (treeNode: EventLoadChildren): Promise<void> => {
    if (treeNode.children && treeNode.children.length) {
      return;
    }

    dispatch(
      loadNodeChildren({
        modelId,
        revisionId,
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
        modelId,
        revisionId,
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
      selectedKeys={state.selectedNodes.map(({ treeIndex }) => treeIndex)}
      loadChildren={loadChildren}
      loadSiblings={loadMoreClicked}
      onCheck={nodeChecked}
      onExpand={nodeExpanded}
      onSelect={nodeSelected}
      height={props.height}
      width={props.width}
    />
  );
}

type WrapperProps = { style?: React.CSSProperties } & Omit<Props, 'height'>;

export function ToolbarTreeView({ style, ...restProps }: WrapperProps) {
  const treeViewContainer = useRef<HTMLDivElement>(null);
  const { height: treeViewHeight } = useResizeHandler(treeViewContainer);

  return (
    <Container style={style} ref={treeViewContainer}>
      <ToolbarTreeViewComponent {...restProps} height={treeViewHeight} />
    </Container>
  );
}
