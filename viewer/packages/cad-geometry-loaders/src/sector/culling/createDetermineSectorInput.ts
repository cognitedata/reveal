/*!
 * Copyright 2022 Cognite AS
 */

// Note! For tests only

import type { CadModelMetadata } from '@reveal/cad-parsers';
import type { CadModelBudget } from '../../CadModelBudget';

import type { DetermineSectorsInput } from './types';
import type { PerspectiveCamera } from 'three';

export function createDetermineSectorInput(
  camera: PerspectiveCamera,
  models: CadModelMetadata | CadModelMetadata[],
  budget?: CadModelBudget
): DetermineSectorsInput {
  const modelArray = Array.isArray(models) ? models : [models];
  const determineSectorsInput: DetermineSectorsInput = {
    camera,
    modelClippingPlanes: new Array(modelArray.length).fill([]),
    cadModelsMetadata: modelArray,
    loadingHints: {},
    cameraInMotion: false,
    budget: budget || {
      highDetailProximityThreshold: 10,
      maximumRenderCost: Infinity
    },
    prioritizedAreas: [],
    lockedModelIdentifiers: new Set(),
    lockedSectorIdsByModel: new Map()
  };
  return determineSectorsInput;
}
