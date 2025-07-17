import type { DmsUniqueIdentifier } from '../../../data-providers';
import { isDefined } from '../../../utilities/isDefined';
import type {
  ClassicCadAssetMapping,
  DmCadAssetMapping,
  HybridCadAssetMapping
} from './assetMappingTypes';

export type RawCdfHybridCadAssetMappingBase = {
  nodeId: number;
  assetId?: number;
  assetInstanceId?: DmsUniqueIdentifier;
};

/**
 * The raw CDF asset mapping type, including DM instance IDs
 * The AssetMapping3D type defined in the SDK does not cover all variations,
 * in particular it always requires `assetId` to be defined, but it may be undefined
 * if `assetInstanceId` is defined
 */

export type RawCdfHybridCadAssetMapping = RawCdfHybridCadAssetMappingBase & {
  treeIndex?: number;
  subtreeSize?: number;
};

type ValidCdfHybridCadAssetMapping = RawCdfHybridCadAssetMappingBase & {
  treeIndex: number;
  subtreeSize: number;
};

/**
 * older asset mappings in the Asset Mappings API may not have treeIndex and subtreeSize.
 * This type guard is used to catch these cases in runtime
 */
function isValidCdfHybridCadAssetMapping(
  assetMapping: RawCdfHybridCadAssetMapping
): assetMapping is ValidCdfHybridCadAssetMapping {
  return assetMapping.treeIndex !== undefined && assetMapping.subtreeSize !== undefined;
}

export function extractHybridAssetMappings(
  rawAssetMapping: RawCdfHybridCadAssetMapping
): HybridCadAssetMapping[] {
  if (!isValidCdfHybridCadAssetMapping(rawAssetMapping)) {
    return [];
  }

  return [
    extractClassicAssetMapping(rawAssetMapping),
    extractDmAssetMapping(rawAssetMapping)
  ].filter(isDefined);
}

function extractClassicAssetMapping(
  validAssetMapping: ValidCdfHybridCadAssetMapping
): ClassicCadAssetMapping | undefined {
  if (validAssetMapping.assetId === undefined) {
    return undefined;
  }
  return {
    nodeId: validAssetMapping.nodeId,
    treeIndex: validAssetMapping.treeIndex,
    subtreeSize: validAssetMapping.subtreeSize,
    assetId: validAssetMapping.assetId
  };
}

function extractDmAssetMapping(
  validAssetMapping: ValidCdfHybridCadAssetMapping
): DmCadAssetMapping | undefined {
  if (validAssetMapping.assetInstanceId === undefined) {
    return undefined;
  }

  return {
    nodeId: validAssetMapping.nodeId,
    treeIndex: validAssetMapping.treeIndex,
    subtreeSize: validAssetMapping.subtreeSize,
    instanceId: validAssetMapping.assetInstanceId
  };
}
