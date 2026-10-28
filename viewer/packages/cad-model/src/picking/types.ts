/*!
 * Copyright 2026 Cognite AS
 */

import type { Object3D, Vector3 } from 'three';
import type { CadNode } from '../wrappers/CadNode';

export type IntersectCadNodesResult = {
  distance: number;
  point: Vector3;
  treeIndex: number;
  cadNode: CadNode;
  object: Object3D; // always CadNode
};
