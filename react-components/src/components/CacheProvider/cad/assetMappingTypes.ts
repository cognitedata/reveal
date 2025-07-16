import { type AssetMapping3D, type CogniteInternalId } from '@cognite/sdk';
import { type CadNodeIdData, type CadNodeTreeData } from '../types';
import { type DmsUniqueIdentifier } from '../../../data-providers';

/**
 * asset mapping with treeIndex, subtreeSize and nodeId
 */
export type ClassicCadAssetMapping = CadNodeIdData & {
  assetId: CogniteInternalId;
};

export type DmCadAssetMapping = CadNodeIdData & {
  instanceId: DmsUniqueIdentifier;
};

export type HybridCadAssetMapping = ClassicCadAssetMapping | DmCadAssetMapping;

export function isClassicCadAssetMapping(
  assetMapping: HybridCadAssetMapping
): assetMapping is ClassicCadAssetMapping {
  return (
    'assetId' in assetMapping &&
    assetMapping.assetId !== undefined &&
    !('instanceId' in assetMapping)
  );
}

export function isDmCadAssetMapping(
  assetMapping: HybridCadAssetMapping
): assetMapping is DmCadAssetMapping {
  return (
    'instanceId' in assetMapping &&
    assetMapping.instanceId !== undefined &&
    !('assetId' in assetMapping)
  );
}

/**
 * older asset mappings in the Asset Mappings API may not have treeIndex and subtreeSize.
 * This type guard is used to catch these cases in runtime
 */
export function isValidClassicCadAssetMapping(
  assetMapping: AssetMapping3D
): assetMapping is ClassicCadAssetMapping {
  return assetMapping.treeIndex !== undefined && assetMapping.subtreeSize !== undefined;
}

/**
 * asset mapping with treeIndex and subtreeSize only
 */
export type ClassicCadAssetTreeIndexMapping = CadNodeTreeData & {
  assetId: CogniteInternalId;
};

export type DmCadAssetTreeIndexMapping = CadNodeTreeData & {
  instanceId: DmsUniqueIdentifier;
};

export type HybridCadAssetTreeIndexMapping =
  | ClassicCadAssetTreeIndexMapping
  | DmCadAssetTreeIndexMapping;

export function isClassicCadAssetTreeIndexMapping(
  mapping: HybridCadAssetTreeIndexMapping
): mapping is ClassicCadAssetTreeIndexMapping {
  return 'assetId' in mapping && mapping.assetId !== undefined && !('instanceId' in mapping);
}

export function isDmCadAssetTreeIndexMapping(
  mapping: HybridCadAssetTreeIndexMapping
): mapping is DmCadAssetTreeIndexMapping {
  return 'instanceId' in mapping && mapping.instanceId !== undefined && !('assetId' in mapping);
}
