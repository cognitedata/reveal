import { DataNode, EventDataNode } from 'antd-v4/lib/tree';
import { v3 } from '@cognite/cdf-sdk-singleton';

type DataNodeWithTitle = DataNode & {
  title: NonNullable<Pick<Required<DataNode>, 'title'>['title']>;
};

export interface TreeDataNode extends DataNodeWithTitle {
  key: number; // treeIndex
  meta: v3.Node3D;
  children?: CustomDataNode[];
}

export interface TreeLoadMoreNode extends DataNodeWithTitle {
  key: string;
  cursor: string;
  parent: {
    nodeId: number;
    treeIndex: number;
  };
  children?: never;
}

export type CustomDataNode = TreeDataNode | TreeLoadMoreNode;

export type EventLoadChildren = EventDataNode & TreeDataNode;

export type EventTreeNodeSelected<T = TreeDataNode> = {
  event: 'select';
  selected: boolean;
  node: T;
  selectedNodes: T[];
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
};
