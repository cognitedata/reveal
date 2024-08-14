/*!
 * Copyright 2023 Cognite AS
 */

import { type FdmKey, type ModelNodeIdKey, type ModelRevisionKey } from './types';

import { split } from 'lodash';

export function createModelRevisionKey(modelId: number, revisionId: number): ModelRevisionKey {
  return `${modelId}/${revisionId}`;
}

export function revisionKeyToIds(revisionKey: ModelRevisionKey): [number, number] {
  const components = split(revisionKey, '/');
  return [Number(components[0]), Number(components[1])];
}

export function createModelNodeIdKey(
  modelId: number,
  revisionId: number,
  nodeId: number
): ModelNodeIdKey {
  return `${modelId}/${revisionId}/${nodeId}`;
}

export function createFdmKey(spaceId: string, externalId: string): FdmKey {
  return `${spaceId}/${externalId}`;
}
