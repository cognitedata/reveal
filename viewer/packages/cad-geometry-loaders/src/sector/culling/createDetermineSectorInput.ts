/*!
 * Copyright 2022 Cognite AS
 */

// Note! For tests only

import { CadModelMetadata } from '@reveal/cad-parsers';
import { CadModelBudget } from '../../CadModelBudget';

import { DetermineSectorsInput } from './types';

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
