/*!
 * Copyright 2020 Cognite AS
 */

import { Cognite3DModel } from './Cognite3DModel';

/**
 * Represents the result from {@link Cognite3DViewer.getInterSectionFromPixel}.
 * @module @cognite/reveal
 */
export interface Intersection {
  model: Cognite3DModel;
  nodeId: number;
  treeIndex: number;
  point: THREE.Vector3;
}
