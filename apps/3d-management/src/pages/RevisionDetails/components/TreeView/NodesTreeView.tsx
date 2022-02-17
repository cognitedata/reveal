import React, { MutableRefObject } from 'react';
import { Tree, TreeProps } from 'antd';
import { SelectedNode, TreeIndex } from 'store/modules/TreeView';
import {
  INFO_BTN_CLASSNAME,
  TREE_NODE_CLASSNAME,
} from 'pages/RevisionDetails/components/TreeView/NodeWithInfoButton';
import {
  calcRangeKeys,
  convertKeysToSelectedNodes,
} from 'pages/RevisionDetails/components/TreeView/utils/treeViewMultiselectionUtils';
import styled from 'styled-components';
import {
  CustomDataNode,
  EventTreeNodeSelected,
  TreeDataNode,
  TreeLoadMoreNode,
} from './types';
import { useKeyboardHandler } from './hooks/useKeyboardHandler';

type ModifiedTreeProps = {
  treeData: Array<TreeDataNode>;

  checkedKeys: Array<TreeIndex>;
  expandedKeys: Array<TreeIndex>;
  selectedNodes: Array<SelectedNode>;

  height: number;

  onNodeInfoRequest: (treeIndex: number) => void;
  onSelect: (selectedKeys: Array<SelectedNode>) => void;
  onCheck: (checkedKeys: Array<number>) => void;
  onExpand: (expandedKeys: Array<number>) => void;
  loadChildren: (node: TreeDataNode) => Promise<void>;
  loadSiblings: (node: TreeLoadMoreNode) => void;

  // When checkable and checkStrictly is true, onCheck arg has checked and halfChecked
  // instead of single array of checked items. We don't support that case.
  checkStrictly?: false;
};
export type NodesTreeViewProps = Omit<TreeProps, keyof ModifiedTreeProps> &
  ModifiedTreeProps;

// struggled with proper ref type so used that type with actually used methods
export type NodesTreeViewRefType = {
  scrollTo: (args: {
    key: string | number;
    align?: 'top' | 'bottom' | 'auto';
    offset?: number;
  }) => void;
};

const TreeStyled = styled(Tree)`
  user-select: none;

  .${TREE_NODE_CLASSNAME} {
    word-break: break-all;
  }

  .${INFO_BTN_CLASSNAME} {
    color: rgb(223, 226, 229);
    cursor: pointer;
    display: inline-block;

    /* extend click area a bit */
    position: relative;
    &:after {
      content: ' ';
      position: absolute;
      top: -25%;
      left: -25%;
      height: 150%;
      width: 150%;
    }

    svg {
      width: unset;
      height: unset;
      margin-bottom: -2px;
    }

    &:hover {
      color: rgba(24, 144, 255, 0.9);
    }
  }
`;

const NodesTreeView = React.forwardRef<
  NodesTreeViewRefType,
  NodesTreeViewProps
>(
  (
    {
      checkedKeys,
      expandedKeys,
      height,
      loadChildren,
      loadSiblings,
      onCheck,
      onExpand,
      onNodeInfoRequest,
      onSelect,
      selectedNodes,
      treeData,
      ...restProps
    }: NodesTreeViewProps,
    forwardedRef
  ) => {
    const {
      lastSelectedKeyRef,
      cachedSelectedKeysRef,
      lastSelectedRangeTailRef,
    } = useKeyboardHandler({
      checkedKeys,
      expandedKeys,
      loadChildren,
      onCheck,
      onExpand,
      onSelect,
      selectedNodes,
      treeData,

      treeRef: forwardedRef as MutableRefObject<NodesTreeViewRefType> | null,
    });

    const isInfoIconClicked = (info: EventTreeNodeSelected<any>) => {
      return info.nativeEvent.composedPath().some((el) => {
        // @ts-ignore EventTarget type declaration is very short
        const classList = el && el.classList;
        if (!classList) {
          return false;
        }

        return classList.contains(INFO_BTN_CLASSNAME);
      });
    };

    const getSelectedNodes = (
      keys: Array<TreeIndex>,
      event: EventTreeNodeSelected<TreeDataNode>
    ): Array<SelectedNode> => {
      const { node, nativeEvent } = event;
      const { key } = node;

      // Windows / Mac single pick
      const ctrlPick: boolean = nativeEvent.ctrlKey || nativeEvent.metaKey;
      const shiftPick: boolean = nativeEvent.shiftKey;

      let newSelectedKeys: Array<TreeIndex>;

      if (shiftPick && lastSelectedKeyRef.current) {
        lastSelectedRangeTailRef.current = key;
        // cachedSelectedKeysRef isn't updated here on purpose
        // to have an ability to shrink what's selected
        newSelectedKeys = Array.from(
          new Set([
            ...(cachedSelectedKeysRef.current || []),
            ...calcRangeKeys({
              treeData,
              expandedKeys,
              startKey: lastSelectedKeyRef.current,
              endKey: lastSelectedRangeTailRef.current,
            }),
          ])
        );
      } else {
        lastSelectedRangeTailRef.current = undefined;
        if (ctrlPick) {
          // Control click
          newSelectedKeys = keys;
          lastSelectedKeyRef.current = key;
          cachedSelectedKeysRef.current = newSelectedKeys;
        }
        // Single click
        else if (
          selectedNodes.length === 1 &&
          selectedNodes[0].treeIndex === key
        ) {
          newSelectedKeys = [];
          lastSelectedKeyRef.current = undefined;
          cachedSelectedKeysRef.current = newSelectedKeys;
        } else {
          newSelectedKeys = [key];
          lastSelectedKeyRef.current = key;
          cachedSelectedKeysRef.current = newSelectedKeys;
        }
      }

      return convertKeysToSelectedNodes(treeData, newSelectedKeys);
    };

    const onNodeClicked = (
      selectedKeys: Array<number | string>,
      info:
        | EventTreeNodeSelected<CustomDataNode>
        | EventTreeNodeSelected<TreeDataNode>
    ) => {
      if ('cursor' in info.node) {
        loadSiblings(info.node as TreeLoadMoreNode);
      } else if (isInfoIconClicked(info)) {
        onNodeInfoRequest(info.node.meta.treeIndex);
      } else {
        onSelect(
          getSelectedNodes(
            selectedKeys as Array<TreeIndex>,
            info as EventTreeNodeSelected<TreeDataNode>
          )
        );
      }
    };

    if (!treeData.length) {
      return <div />;
    }

    return (
      <TreeStyled
        ref={forwardedRef as any}
        className="TREE"
        treeData={treeData}
        checkedKeys={checkedKeys}
        selectedKeys={selectedNodes.map(({ treeIndex }) => treeIndex)}
        expandedKeys={expandedKeys}
        showLine={{ showLeafIcon: false }}
        checkable
        loadData={loadChildren as any}
        onSelect={onNodeClicked as any}
        onCheck={onCheck as any}
        onExpand={onExpand as any}
        height={height}
        virtual
        multiple
        {...restProps}
      />
    );
  }
);

export default React.memo(NodesTreeView);
