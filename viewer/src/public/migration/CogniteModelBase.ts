/*!
 * Copyright 2020 Cognite AS
 */

import { SupportedModelTypes } from './types';

export interface CogniteModelBase {
  readonly type: SupportedModelTypes;
  dispose(): void;
  getModelBoundingBox(): THREE.Box3;
  updateTransformation(matrix: THREE.Matrix4): void;
}
