/*!
 * Copyright 2021 Cognite AS
 */

import { LevelOfDetail } from '@reveal/cad-parsers';

import { DetermineSectorsInput } from './culling/types';

export function loadingEnabled({ cadModelsMetadata, loadingHints }: DetermineSectorsInput): boolean {
  return cadModelsMetadata.length > 0 && loadingHints.suspendLoading !== true;
}

export interface ModelState {
  [id: number]: LevelOfDetail;
}
export interface SceneModelState {
  [modelIdentifier: string]: ModelState;
}
