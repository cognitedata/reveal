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

export function convertToHybridAssetMapping(
  rawAssetMapping: RawCdfHybridCadAssetMapping
): HybridCadAssetMapping | undefined {
  if (!isValidCdfHybridCadAssetMapping(rawAssetMapping)) {
    return undefined;
  }

  if (isRawClassicAssetMappingInstance(rawAssetMapping)) {
    return {
      nodeId: rawAssetMapping.nodeId,
      treeIndex: rawAssetMapping.treeIndex,
      subtreeSize: rawAssetMapping.subtreeSize,
      assetId: rawAssetMapping.assetId
    };
  }

  if (isRawDmAssetMappingInstance(rawAssetMapping)) {
    return {
      nodeId: rawAssetMapping.nodeId,
      treeIndex: rawAssetMapping.treeIndex,
      subtreeSize: rawAssetMapping.subtreeSize,
      instanceId: rawAssetMapping.assetInstanceId
    };
  }
}
