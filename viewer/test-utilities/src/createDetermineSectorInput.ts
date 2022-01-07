/*!
 * Copyright 2021 Cognite AS
 */

// Note! In testUtilities we need to use relative imports
import { CadModelMetadata } from '../../packages/cad-parsers';
import { DetermineSectorsInput, CadModelBudget } from '../../packages/cad-geometry-loaders';

export function createDetermineSectorInput(
  camera: THREE.PerspectiveCamera,
  models: CadModelMetadata | CadModelMetadata[],
  budget?: CadModelBudget
): DetermineSectorsInput {
  const determineSectorsInput: DetermineSectorsInput = {
    camera,
    clippingPlanes: [],
    cadModelsMetadata: Array.isArray(models) ? models : [models],
    loadingHints: {},
    cameraInMotion: false,
    budget: budget || {
      highDetailProximityThreshold: 10,
      maximumRenderCost: Infinity
    },
    prioritizedAreas: []
  };
  return determineSectorsInput;
}
