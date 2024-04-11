/*!
 * Copyright 2021 Cognite AS
 */

import { LevelOfDetail } from '@reveal/cad-parsers';

import { DetermineSectorsPayload } from './culling/types';

export function loadingEnabled({ models, loadingHints }: DetermineSectorsPayload): boolean {
  return models.length > 0 && loadingHints.suspendLoading !== true;
}

export type ModelState = {
  [id: number]: LevelOfDetail;
};
export type SceneModelState = {
  [modelIdentifier: string]: ModelState;
};
