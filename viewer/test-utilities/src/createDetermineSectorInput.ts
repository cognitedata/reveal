/*!
 * Copyright 2021 Cognite AS
 */

// Note! In testUtilities we need to use relative imports
import { CadModelMetadata } from '../../packages/cad-parsers';
import { CadModelSectorBudget, DetermineSectorsInput } from '../../packages/cad-geometry-loaders';

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
    }
  };
  return determineSectorsInput;
}
