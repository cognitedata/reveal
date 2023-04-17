import * as Automerge from '@automerge/automerge';
import { Edge, Node } from 'reactflow';

export type Canvas = {
  nodes: Node<any>[];
  edges: Edge<any>[];
};

export type Flow = {
  id: string;
  name: string;
  updated?: number;
  description?: string;
  canvas: Canvas;
};

export type AFlow = Automerge.Doc<Flow>;

export type Items<T> = {
  items: T[];
};

export type SdkListData<T> = {
  items: T[];
  nextCursor?: string;
};
