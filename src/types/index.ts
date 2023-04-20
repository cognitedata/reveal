import {
  List as AutomergeList,
  Extend as AutomergeExtend,
} from '@automerge/automerge';
import { Edge, Node } from 'reactflow';

export type CanvasNode = AutomergeExtend<Node<any>>; // FIXME: any
export type CanvasNodes = AutomergeList<CanvasNode>;

export type CanvasEdge = AutomergeExtend<Edge<any>>; // FIXME: any
export type CanvasEdges = AutomergeList<CanvasEdge>;

export type Canvas = {
  nodes: CanvasNodes;
  edges: CanvasEdges;
};

export type Flow = {
  id: string;
  name: string;
  updated?: number;
  description?: string;
  canvas: Canvas;
};

export type AFlow = AutomergeExtend<Flow>;

export type Items<T> = {
  items: T[];
};

export type SdkListData<T> = {
  items: T[];
  nextCursor?: string;
};
