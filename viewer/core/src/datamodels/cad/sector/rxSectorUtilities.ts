/*!
 * Copyright 2021 Cognite AS
 */

import { DetermineSectorsInput } from './culling/types';
import { LevelOfDetail } from './LevelOfDetail';

export function loadingEnabled({ cadModelsMetadata, loadingHints }: DetermineSectorsInput) {
  return cadModelsMetadata.length > 0 && loadingHints.suspendLoading !== true;
}

export interface ModelState {
  [id: number]: LevelOfDetail;
}
export interface SceneModelState {
  [modelIdentifier: string]: ModelState;
}
