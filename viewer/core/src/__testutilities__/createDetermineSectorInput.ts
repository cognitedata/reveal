/*!
 * Copyright 2021 Cognite AS
 */

import { CadModelSectorBudget } from '../datamodels/cad/CadModelSectorBudget';
import { CadModelMetadata, DetermineSectorsInput } from '../internals';

export function createDetermineSectorInput(
  camera: THREE.PerspectiveCamera,
  models: CadModelMetadata | CadModelMetadata[],
  budget?: CadModelSectorBudget
): DetermineSectorsInput {
  const determineSectorsInput: DetermineSectorsInput = {
    camera,
    clippingPlanes: [],
    cadModelsMetadata: Array.isArray(models) ? models : [models],
    loadingHints: {},
    cameraInMotion: false,
    budget: budget || {
      geometryDownloadSizeBytes: 20,
      highDetailProximityThreshold: 10,
      maximumNumberOfDrawCalls: Infinity,
      maximumRenderCost: Infinity
    },
    prioritizedAreas: []
  };
  return determineSectorsInput;
}
