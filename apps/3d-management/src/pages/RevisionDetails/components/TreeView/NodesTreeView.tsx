import React from 'react';
import { useGlobalStyles } from '@cognite/cdf-utilities';
import Tree from 'antd-v4/lib/tree';
import { TreeProps } from 'antd-v4/lib/tree/Tree';
import { SelectedNode } from 'src/store/modules/TreeView';
import {
  CheckInfo,
  CustomDataNode,
  EventLoadChildren,
  EventTreeNodeSelected,
  TreeDataNode,
  TreeLoadMoreNode,
} from './types';
import antd4Styles from './antd4-tree-styles.css';

type Props = Omit<TreeProps, 'onSelect' | 'onCheck' | 'onExpand' | 'loadData'> &
  Required<Pick<TreeProps, 'checkedKeys' | 'expandedKeys' | 'selectedKeys'>> & {
    treeData: Array<CustomDataNode>;

    width: number;
    height: number;

    onSelect: (
      selectedKeys: Array<SelectedNode>,
      info: EventTreeNodeSelected
    ) => void;
    onCheck: (checkedKeys: Array<number>, info: CheckInfo) => void;
    onExpand: (
      expandedKeys: Array<number>,
      info: {
        node: TreeDataNode;
        expanded: boolean;
        nativeEvent: MouseEvent;
      }
    ) => void;
    loadChildren: (node: EventLoadChildren) => Promise<void>;
    loadSiblings: (node: TreeLoadMoreNode) => void;

    // When checkable and checkStrictly is true, its object has checked and halfChecked
    // we don't support that case
    checkStrictly?: false;
  };

// struggled with proper ref type so used that type with actually used methods
export type NodesTreeViewRefType = {
  scrollTo: (key: string | number) => void;
};

const NodesTreeView = React.forwardRef<NodesTreeViewRefType, Props>(
  (
    {
      height,
      width,
      loadSiblings,
      onSelect,
      onCheck,
      onExpand,
      loadChildren,
      ...restProps
    }: Props,
    forwardedRef
  ) => {
    useGlobalStyles([antd4Styles]);

    const onNodeSelected = (
      selectedKeys: Array<number | string>,
      info:
        | EventTreeNodeSelected<CustomDataNode>
        | EventTreeNodeSelected<TreeDataNode>
    ) => {
      if ('cursor' in info.node) {
        loadSiblings(info.node);
      } else {
        onSelect(
          (info as EventTreeNodeSelected<TreeDataNode>).selectedNodes.map(
            (node) => ({
              treeIndex: node.key,
              nodeId: node.meta.id,
              subtreeSize: node.meta.subtreeSize,
            })
          ),
          info as EventTreeNodeSelected<TreeDataNode>
        );
      }
    };

    if (!restProps.treeData.length) {
      return <div />;
    }

    return (
      <Tree
        ref={forwardedRef as any}
        style={{
          width,
          maxHeight: height,
        }}
        showLine={{ showLeafIcon: false }}
        checkable
        loadData={loadChildren as any}
        onSelect={onNodeSelected as any}
        onCheck={onCheck as any}
        onExpand={onExpand as any}
        height={height}
        virtual
        {...restProps}
      />
    );
  }
);

export default React.memo(NodesTreeView);
