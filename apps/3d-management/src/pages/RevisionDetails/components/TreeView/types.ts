import { DataNode, EventDataNode } from 'antd/lib/tree';
import { Node3D } from '@cognite/sdk';

type DataNodeWithTitle = DataNode & {
  title: NonNullable<Pick<Required<DataNode>, 'title'>['title']>;
};

export interface TreeDataNode extends DataNodeWithTitle {
  isTreeDataNode: true;
  key: number; // treeIndex
  meta: Node3D;
  children?: CustomDataNode[];
}

export interface TreeLoadMoreNode extends DataNodeWithTitle {
  isTreeDataNode: false;
  key: string;
  cursor: string;
  parent: {
    nodeId: number;
    treeIndex: number;
  };
  children?: never;
}

export type CustomDataNode = TreeDataNode | TreeLoadMoreNode;

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
