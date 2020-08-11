/*!
 * Copyright 2020 Cognite AS
 */

import { SupportedModelTypes } from '@/datamodels/base';

export interface CogniteModelBase {
  readonly type: SupportedModelTypes;
  dispose(): void;
  getModelBoundingBox(outBbox?: THREE.Box3): THREE.Box3;
  updateTransformation(matrix: THREE.Matrix4): void;
}
