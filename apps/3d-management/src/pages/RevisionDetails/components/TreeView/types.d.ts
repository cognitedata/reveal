import { TreeProps } from 'antd-v4/lib/tree/Tree';
import { DataNode, EventDataNode } from 'antd-v4/lib/tree';
import { v3 } from '@cognite/cdf-sdk-singleton';
import { Key } from 'rc-tree/lib/interface';

export interface TreeViewProps extends TreeProps {
  modelId: number;
  revisionId: number;
  width: number;
  height: number;

  onSelect?: (
    selectedKeys: Array<string | number>,
    info: EventTreeNodeSelected
  ) => void;
  onCheck?: (checkedKeys: Array<string | number>, info: CheckInfo) => void;

  onError?: (error: Error) => void;

  // When checkable and checkStrictly is true, its object has checked and halfChecked
  // we don't support that case
  checkStrictly?: false;
}

export type State = {
  loading: boolean;
  treeData: Array<CustomDataNode>;
  error: Error | null;
};

export interface TreeDataNode extends DataNode {
  key: number; // treeIndex
  meta: v3.Node3D;
  children?: CustomDataNode[];
}

export interface TreeLoadMoreNode extends DataNode {
  nextCursor: string;
  parent: {
    nodeId: number;
    treeIndex: number;
  };
}

export type CustomDataNode = TreeDataNode | TreeLoadMoreNode;

export type EventLoadMore = EventDataNode & TreeDataNode;

export type EventTreeNodeSelected = {
  event: 'select';
  selected: boolean;
  node: CustomDataNode;
  selectedNodes: CustomDataNode[];
  nativeEvent: MouseEvent;
};

export type CheckInfo = {
  event: 'check';
  node: EventDataNode;
  checked: boolean;
  nativeEvent: MouseEvent;
  checkedNodes: CustomDataNode[];
  checkedNodesPositions?: {
    node: CustomDataNode;
    pos: string;
  }[];
  halfCheckedKeys?: Key[];
};

export type FetchAction = { type: 'FETCH' };
export type FetchActionOk = {
  type: 'FETCH_OK';
  payload: { treeData: Array<CustomDataNode>; parentNodeKey?: number };
};
export type FetchActionError = {
  type: 'FETCH_ERROR';
  payload: { error: Error };
};

export type LoadMore = { type: 'LOAD_MORE'; payload: { key: string | number } };
export type LoadMoreOk = {
  type: 'LOAD_MORE_OK';
  payload: { key: string | number };
};
export type LoadMoreError = {
  type: 'LOAD_MORE_ERROR';
  payload: { key: string | number; error: Error };
};

export type Actions =
  | FetchAction
  | FetchActionOk
  | FetchActionError
  | LoadMore
  | LoadMoreOk
  | LoadMoreError;
