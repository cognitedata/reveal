import { Edge, Node } from 'react-flow-renderer';

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

export type Items<T> = {
  items: T[];
};
