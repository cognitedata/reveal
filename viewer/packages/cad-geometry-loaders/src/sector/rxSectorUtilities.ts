/*!
 * Copyright 2021 Cognite AS
 */

import { LevelOfDetail } from '@reveal/cad-parsers';

import { DetermineSectorsPayload } from './culling/types';

export function loadingEnabled({ models, loadingHints }: DetermineSectorsPayload): boolean {
  return models.length > 0 && loadingHints.suspendLoading !== true;
}

export interface ModelState {
  [id: number]: LevelOfDetail;
}
export interface SceneModelState {
  [modelIdentifier: symbol]: ModelState;
}
