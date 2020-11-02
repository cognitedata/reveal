import React, {
  PropsWithChildren,
  useCallback,
  useEffect,
  useReducer,
  useState,
} from 'react';
import { useGlobalStyles } from '@cognite/cdf-utilities';
import Tree, { EventDataNode } from 'antd-v4/lib/tree';
import { v3Client, v3 } from '@cognite/cdf-sdk-singleton';
import styled from 'styled-components';
import Spinner from 'src/components/Spinner';
import debounce from 'lodash/debounce';
import { node3dToCustomDataNode } from './utils/node3dToCustomDataNode';
import {
  Actions,
  CustomDataNode,
  EventLoadMore,
  EventTreeNodeSelected,
  State,
  TreeLoadMoreNode,
  TreeViewProps,
} from './types';
import {
  addChildrenIntoTree,
  removeNodeFromTree,
  updateNodeById,
} from './utils/treeFunctions';
import antd4Styles from './antd4-tree-styles.css';

function reducer(prevState: State, action: Actions) {
  switch (action.type) {
    case 'FETCH': {
      return {
        ...prevState,
        loading: true,
        error: null,
      };
    }
    case 'FETCH_OK': {
      return {
        ...prevState,
        treeData: addChildrenIntoTree(
          prevState.treeData,
          action.payload.parentNodeKey,
          action.payload.treeData
        ),
        loading: false,
      };
    }
    case 'FETCH_ERROR': {
      return {
        ...prevState,
        error: action.payload.error,
        loading: false,
      };
    }

    case 'LOAD_MORE': {
      return {
        ...prevState,
        treeData: updateNodeById<CustomDataNode>(
          prevState.treeData,
          action.payload.key,
          {
            title: (
              <LoadMore onClick={(e) => e.preventDefault()}>
                Loading...
              </LoadMore>
            ),
          }
        ),
      };
    }
    case 'LOAD_MORE_OK': {
      return {
        ...prevState,
        treeData: removeNodeFromTree<CustomDataNode>(
          prevState.treeData,
          action.payload.key
        ),
      };
    }
    case 'LOAD_MORE_ERROR': {
      return {
        ...prevState,
        error: action.payload.error,
        treeData: updateNodeById<CustomDataNode>(
          prevState.treeData,
          action.payload.key,
          { title: <LoadMore /> }
        ),
      };
    }
  }

  return prevState;
}

const LoadMoreWrapper = styled.b`
  &:hover {
    cursor: pointer;
    user-select: none;
  }
`;
const LoadMore = (props: PropsWithChildren<any>) => (
  <LoadMoreWrapper>{props.children || 'Load more...'}</LoadMoreWrapper>
);

const TreeView = (props: TreeViewProps) => {
  useGlobalStyles([antd4Styles]);

  const [state, dispatch] = useReducer(reducer, {
    loading: false,
    treeData: [],
    error: null,
  });
  const [expandedRootItems, setExpandedRootItems] = useState<
    Array<string | number>
  >();

  const { height, width, onCheck, onError, ...restProps } = props;

  useEffect(() => {
    if (onError && state.error) {
      onError(state.error);
    }
  }, [onError, state.error]);

  const fetchNodes = useCallback(
    async (
      modelId: number,
      revisionId: number,
      parent?: { nodeId: number; treeIndex: number },
      nextCursor?: string
    ) => {
      dispatch({ type: 'FETCH' });

      try {
        const params: v3.List3DNodesQuery = {
          limit: 100,
          depth: 1,
          cursor: nextCursor,
          nodeId: parent?.nodeId,
        };
        const data: v3.ListResponse<
          v3.Node3D[]
        > = await v3Client.revisions3D.list3DNodes(modelId, revisionId, params);

        let treeData: CustomDataNode[];

        // root-node request specific part
        if (!parent) {
          // root node
          treeData = node3dToCustomDataNode(data.items.slice(0, 1));
          treeData[0].children = node3dToCustomDataNode(data.items.slice(1));
        } else {
          // first item is always the node that passed in request options as nodeId
          treeData = node3dToCustomDataNode(data.items.slice(1));
        }

        if (data.nextCursor) {
          const loadMoreOption: TreeLoadMoreNode = {
            key: `${parent?.treeIndex}${Math.random()}`,
            title: <LoadMore />,
            nextCursor: data.nextCursor,
            parent: parent || {
              nodeId: data.items[0].id,
              treeIndex: data.items[0].treeIndex,
            },
            checkable: false,
            isLeaf: true,
          };
          if (parent) {
            treeData.push(loadMoreOption);
          } else {
            treeData[0].children!.push(loadMoreOption);
          }
        }

        dispatch({
          type: 'FETCH_OK',
          payload: {
            treeData,
            parentNodeKey: parent?.treeIndex,
          },
        });

        if (!parent) {
          setExpandedRootItems(treeData.map((rootItem) => rootItem.key));
        }
      } catch (error) {
        dispatch({ type: 'FETCH_ERROR', payload: { error } });
      }
    },
    []
  );

  useEffect(() => {
    fetchNodes(props.modelId, props.revisionId);
  }, [props.modelId, props.revisionId, fetchNodes]);

  const onLoadData = async (treeNode: EventLoadMore): Promise<void> => {
    if (treeNode.children && treeNode.children.length) {
      return;
    }

    await fetchNodes(props.modelId, props.revisionId, {
      nodeId: treeNode.meta.id,
      treeIndex: treeNode.key,
    });
  };

  const onSelect = useCallback(
    debounce(
      (selectedKeys: Array<string | number>, info: EventTreeNodeSelected) => {
        if ('nextCursor' in info.node) {
          dispatch({ type: 'LOAD_MORE', payload: { key: info.node.key } });
          fetchNodes(
            props.modelId,
            props.revisionId,
            info.node.parent,
            info.node.nextCursor
          )
            .then(() => {
              dispatch({
                type: 'LOAD_MORE_OK',
                payload: { key: info.node.key },
              });
            })
            .catch((error) => {
              dispatch({
                type: 'LOAD_MORE_ERROR',
                payload: { key: info.node.key, error },
              });
            });
        }

        if (props.onSelect) {
          props.onSelect(selectedKeys, info);
        }
      },
      500, // just to disallow double-clicks
      { leading: true, trailing: false }
    ),
    [props.modelId, props.revisionId]
  );

  // that's a workaround to have 1st level nodes expanded and selected by default
  // you can't specify default items after component is mounted - it won't have any effect
  if (!expandedRootItems) {
    if (state.loading) {
      return <Spinner />;
    }
    return <div>{state.error && state.error.message}</div>;
  }

  return (
    <Tree
      style={{
        width,
        maxHeight: height,
      }}
      defaultExpandedKeys={expandedRootItems}
      defaultCheckedKeys={expandedRootItems}
      checkable
      loadData={onLoadData as (n: EventDataNode) => Promise<void>}
      onSelect={
        onSelect as any /* selected and checked keys have wider type in rc-tree */
      }
      onCheck={onCheck as any}
      treeData={state.treeData}
      height={height}
      virtual
      {...restProps}
    />
  );
};

export default React.memo(TreeView);
