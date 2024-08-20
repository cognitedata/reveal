/*!
 * Copyright 2023 Cognite AS
 */

import { ExternalId, Space } from '../../data-providers/FdmSDK';
import {
  type FdmKey,
  type ModelTreeIndexKey,
  type ModelRevisionKey,
  TreeIndex,
  RevisionId,
  ModelId
} from './types';

import { split } from 'lodash';

export function createModelRevisionKey(modelId: ModelId, revisionId: RevisionId): ModelRevisionKey {
  return `${modelId}/${revisionId}`;
}

export function revisionKeyToIds(revisionKey: ModelRevisionKey): [ModelId, RevisionId] {
  const components = split(revisionKey, '/');
  return [Number(components[0]), Number(components[1])];
}

export function createModelTreeIndexKey(
  modelId: ModelId,
  revisionId: RevisionId,
  treeIndex: TreeIndex
): ModelTreeIndexKey {
  return `${modelId}/${revisionId}/${treeIndex}`;
}

export function createFdmKey(spaceId: Space, externalId: ExternalId): FdmKey {
  return `${spaceId}/${externalId}`;
}
