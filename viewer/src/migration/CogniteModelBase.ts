/*!
 * Copyright 2020 Cognite AS
 */

import { WellKnownModelTypes } from './types';

export interface CogniteModelBase {
  readonly type: WellKnownModelTypes;
  dispose(): void;
  getModelBoundingBox(): THREE.Box3;
}
