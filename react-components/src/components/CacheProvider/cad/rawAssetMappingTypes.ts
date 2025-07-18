import type { DmsUniqueIdentifier } from '../../../data-providers';
import { isDefined } from '../../../utilities/isDefined';
import { AssetId, NodeId, TreeIndex } from '../types';
import type {
  ClassicCadAssetMapping,
  DmCadAssetMapping,
  HybridCadAssetMapping
} from './assetMappingTypes';

/**
 * The raw CDF asset mapping type, including DM instance IDs
 * The AssetMapping3D type defined in the SDK does not cover all variations,
 * in particular it always requires `assetId` to be defined, but it may be undefined
 * if `assetInstanceId` is defined. Therefore we introduce the `RawCdfHybridCadASsetMapping
 */

export type RawCdfCadAssetMappingClassicInstance = { assetId: AssetId };
export type RawCdfCadAssetMappingDmInstance = { assetInstanceId: DmsUniqueIdentifier };
export type RawCdfCadAssetMappingHybridInstance =
  | RawCdfCadAssetMappingClassicInstance
  | RawCdfCadAssetMappingDmInstance;

export type RawCdfHybridCadAssetMappingBase = {
  nodeId: NodeId;
} & RawCdfCadAssetMappingHybridInstance;

export type RawCdfHybridCadAssetMapping = RawCdfHybridCadAssetMappingBase & {
  treeIndex?: TreeIndex;
  subtreeSize?: number;
};

type ValidCdfHybridCadAssetMapping = RawCdfHybridCadAssetMappingBase & {
  treeIndex: TreeIndex;
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

function isRawClassicAssetMappingInstance(
  assetMappingInstance: RawCdfCadAssetMappingHybridInstance
): assetMappingInstance is RawCdfCadAssetMappingClassicInstance {
  return (
    'assetId' in assetMappingInstance &&
    assetMappingInstance.assetId !== undefined &&
    !('assetIntanceId' in assetMappingInstance)
  );
}

function isRawDmAssetMappingInstance(
  assetMappingInstance: RawCdfCadAssetMappingHybridInstance
): assetMappingInstance is RawCdfCadAssetMappingDmInstance {
  return (
    'assetInstanceId' in assetMappingInstance &&
    assetMappingInstance.assetInstanceId !== undefined &&
    !('assetId' in assetMappingInstance)
  );
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
  if (!isRawClassicAssetMappingInstance(validAssetMapping)) {
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
  if (!isRawDmAssetMappingInstance(validAssetMapping)) {
    return undefined;
  }

  return {
    nodeId: validAssetMapping.nodeId,
    treeIndex: validAssetMapping.treeIndex,
    subtreeSize: validAssetMapping.subtreeSize,
    instanceId: validAssetMapping.assetInstanceId
  };
}
