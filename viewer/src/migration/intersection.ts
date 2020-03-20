/*!
 * Copyright 2020 Cognite AS
 */

import { Cognite3DModel } from './Cognite3DModel';

export interface Intersection {
  model: Cognite3DModel;
  nodeId: number;
  point: THREE.Vector3;
}
