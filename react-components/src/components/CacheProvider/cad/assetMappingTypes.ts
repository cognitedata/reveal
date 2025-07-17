import { type AssetMapping3D, type CogniteInternalId } from '@cognite/sdk';
import { type AssetId, type CadNodeIdData, type CadNodeTreeData } from '../types';
import { type DmsUniqueIdentifier } from '../../../data-providers';
import { type InstanceId } from '../../../utilities/instanceIds';
import { assertNever } from '../../../utilities/assertNever';

/**
 * Raw CAD instance mapping instance identifier constituents
 */

export type ClassicCadAssetMappingInstance = {
  assetId: AssetId;
};

export type DmCadAssetMappingInstance = {
  instanceId: DmsUniqueIdentifier;
};

export type HybridCadAssetMappingInstance =
  | ClassicCadAssetMappingInstance
  | DmCadAssetMappingInstance;

export function isClassicCadAssetMappingInstance(
  mapping: HybridCadAssetMappingInstance
): mapping is ClassicCadAssetMappingInstance {
  return 'assetId' in mapping && mapping.assetId !== undefined && !('instanceId' in mapping);
}

export function isDmCadAssetMappingInstance(
  mapping: HybridCadAssetMappingInstance
): mapping is DmCadAssetMappingInstance {
  return 'instanceId' in mapping && mapping.instanceId !== undefined && !('assetId' in mapping);
}

/**
 * asset mapping with treeIndex, subtreeSize and nodeId
 */
export type ClassicCadAssetMapping = CadNodeIdData & ClassicCadAssetMappingInstance;
export type DmCadAssetMapping = CadNodeIdData & DmCadAssetMappingInstance;

export type HybridCadAssetMapping = ClassicCadAssetMapping | DmCadAssetMapping;

export function isClassicCadAssetMapping(
  mapping: HybridCadAssetMapping
): mapping is ClassicCadAssetMapping {
  return isClassicCadAssetMappingInstance(mapping);
}

export function isDmCadAssetMapping(mapping: HybridCadAssetMapping): mapping is DmCadAssetMapping {
  return isDmCadAssetMappingInstance(mapping);
}

/**
 * asset mapping with treeIndex and subtreeSize only
 */
export type ClassicCadAssetTreeIndexMapping = CadNodeTreeData & ClassicCadAssetMappingInstance;
export type DmCadAssetTreeIndexMapping = CadNodeTreeData & DmCadAssetMappingInstance;

export type HybridCadAssetTreeIndexMapping =
  | ClassicCadAssetTreeIndexMapping
  | DmCadAssetTreeIndexMapping;

export function isClassicCadAssetTreeIndexMapping(
  mapping: HybridCadAssetTreeIndexMapping
): mapping is ClassicCadAssetTreeIndexMapping {
  return isClassicCadAssetMappingInstance(mapping);
}

export function isDmCadAssetTreeIndexMapping(
  mapping: HybridCadAssetTreeIndexMapping
): mapping is DmCadAssetTreeIndexMapping {
  return isDmCadAssetMappingInstance(mapping);
}

/**
 * asset instance key from mapping
 */
export function getMappingInstanceId(
  mappingInstance: ClassicCadAssetMappingInstance | DmCadAssetMappingInstance
): InstanceId {
  if (isClassicCadAssetMappingInstance(mappingInstance)) {
    return mappingInstance.assetId;
  }

  if (isDmCadAssetMappingInstance(mappingInstance)) {
    return mappingInstance.instanceId;
  }

  assertNever(mappingInstance);
}
