import TreeView, {
  NodesTreeViewRefType,
} from 'src/pages/RevisionDetails/components/TreeView/NodesTreeView';
import React, { useEffect, useRef, useState } from 'react';
import {
  TreeDataNode,
  TreeLoadMoreNode,
} from 'src/pages/RevisionDetails/components/TreeView/types';
import {
  ByNodePropertyNodeSet,
  Cognite3DModel,
  Cognite3DViewer,
  NodeOutlineColor,
} from '@cognite/reveal';
import { useDispatch, useSelector } from 'react-redux';
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
import ErrorBoundary from 'src/components/ErrorBoundary';
import { Button, Title } from '@cognite/cogs.js';
import { v3Client } from '@cognite/cdf-sdk-singleton';
import { useViewerNodeClickListener } from 'src/pages/RevisionDetails/components/ToolbarTreeView/hooks/useViewerNodeClickListener';
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
  height: number;

  onNodeInfoRequested: (treeIndex: number) => void;

  viewer: Cognite3DViewer;
};

function useFilteredNodes({ model }: { model: Cognite3DModel }) {
  const filter = useSelector(
    ({ treeView }: RootState) => treeView.nodePropertyFilter
  );
  const filteredNodes = React.useRef<ByNodePropertyNodeSet>(
    new ByNodePropertyNodeSet(v3Client as any, model, { requestPartitions: 10 })
  );
  useEffect(() => {
    const filteredNodesSet = filteredNodes.current;
    model.addStyledNodeSet(filteredNodesSet, {
      outlineColor: NodeOutlineColor.Cyan,
      renderInFront: true,
      renderGhosted: false,
    });
    return () => {
      model.removeStyledNodeSet(filteredNodesSet);
      if (filteredNodesSet) {
        filteredNodesSet.clear();
      }
    };
  }, [model]);

  useEffect(() => {
    if (!filter) {
      filteredNodes.current.clear();
    } else {
      filteredNodes.current.executeFilter(filter);
    }
  }, [filter]);
}

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

  useViewerNodeClickListener({
    viewer: props.viewer,
    model: props.model,
    treeViewRef,
  });

  useCheckedNodesVisibility({
    model: props.model,
    treeData: state.treeData,
    checkedKeys: state.checkedNodes,
  });

  useFilteredNodes({
    model: props.model,
  });

  useSelectedNodesHighlights({
    model: props.model,
  });

  const loadChildren = async (treeNode: TreeDataNode): Promise<void> => {
    if (treeNode.children && treeNode.children.length) {
      return;
    }

    await dispatch(
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
    throw state.error;
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
    />
  );
}

export type ToolbarTreeViewProps = { style?: React.CSSProperties } & Omit<
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
    <ErrorBoundary
      FallbackComponent={({ error, resetErrorBoundary }) => {
        return (
          <div role="alert" style={{ maxHeight: '100%', textAlign: 'left' }}>
            <Title level={4}>Something went wrong.</Title>

            <div style={{ margin: '16px 0' }}>
              <p>We have been notified and will fix it.</p>
              <Button onClick={resetErrorBoundary} type="primary">
                Reload component
              </Button>
            </div>

            <pre
              style={{
                textAlign: 'left',
                whiteSpace: 'pre-wrap',
                maxWidth: '100%',
                maxHeight: '100%',
                overflow: 'auto',
              }}
            >
              {error.message}
            </pre>
          </div>
        );
      }}
    >
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
    </ErrorBoundary>
  );
}
