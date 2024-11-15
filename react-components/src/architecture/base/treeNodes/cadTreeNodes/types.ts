/*!
 * Copyright 2024 Cognite AS
 */

import { type CadTreeNode } from './CadTreeNode';

export type OnLoadedAction = (node: CadTreeNode, parent?: CadTreeNode) => void;

export type SubsetOfNode3D = {
  id: number;
  treeIndex: number;
  subtreeSize: number;
  name: string;
};

export type RevisionId = {
  modelId: number;
  revisionId: number;
};
