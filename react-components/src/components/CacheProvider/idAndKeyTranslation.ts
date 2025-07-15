import { type DmsUniqueIdentifier } from '../../data-providers/FdmSDK';
import {
  type InstanceId,
  type InstanceKey,
  isClassicInstanceId
} from '../../utilities/instanceIds';
import {
  type FdmKey,
  type ModelTreeIndexKey,
  type ModelRevisionKey,
  type TreeIndex,
  type RevisionId,
  type ModelId,
  type ModelAssetIdKey,
  type AssetId
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

export function createFdmKey(id: DmsUniqueIdentifier): FdmKey {
  return `${id.space}/${id.externalId}`;
}

export function createInstanceKey(id: InstanceId): InstanceKey {
  if (isClassicInstanceId(id)) {
    return id;
  } else {
    return createFdmKey(id);
  }
}

export function modelRevisionNodesAssetToKey(
  modelId: ModelId,
  revisionId: RevisionId,
  id: AssetId
): ModelAssetIdKey {
  return `${modelId}/${revisionId}/${id}`;
}
