import { type DmsUniqueIdentifier } from '../../data-providers/FdmSDK';
import type { InstanceId, InstanceKey } from '../../utilities/instanceIds/types';
import { isClassicInstanceId } from '../../utilities/instanceIds/typeGuards';
import {
  type FdmKey,
  type ModelTreeIndexKey,
  type ModelRevisionKey,
  type TreeIndex,
  type RevisionId,
  type ModelId,
  type ModelInstanceIdKey,
  type NodeId,
  type ModelNodeIdKey
} from './types';

import { split } from 'lodash';

export function createModelRevisionKey(modelId: ModelId, revisionId: RevisionId): ModelRevisionKey {
  return `${modelId}/${revisionId}`;
}

export function revisionKeyToIds(revisionKey: ModelRevisionKey): [ModelId, RevisionId] {
  const components = split(revisionKey, '/');
  return [Number(components[0]), Number(components[1])];
}

export function createFdmKey(id: DmsUniqueIdentifier): FdmKey {
  return `${id.space}/${id.externalId}`;
}

export function fdmKeyToId(fdmKey: FdmKey): DmsUniqueIdentifier {
  const components = split(fdmKey, '/');
  return { space: components[0], externalId: components[1] };
}

export function createInstanceKey(id: InstanceId): InstanceKey {
  if (isClassicInstanceId(id)) {
    return id;
  } else {
    return createFdmKey(id);
  }
}

export function createModelTreeIndexKey(
  modelId: ModelId,
  revisionId: RevisionId,
  treeIndex: TreeIndex
): ModelTreeIndexKey {
  return `${modelId}/${revisionId}/${treeIndex}`;
}

export function createModelInstanceIdKey(
  modelId: ModelId,
  revisionId: RevisionId,
  id: InstanceKey
): ModelInstanceIdKey {
  return `${modelId}/${revisionId}/${id}`;
}

export function createModelNodeIdKey(
  modelId: ModelId,
  revisionId: RevisionId,
  id: NodeId
): ModelNodeIdKey {
  return `${modelId}/${revisionId}/${id}`;
}
