import { type AssetMapping3D, type CogniteInternalId } from '@cognite/sdk';

export type ClassicCadAssetMapping = {
  treeIndex: number;
  subtreeSize: number;
  nodeId: CogniteInternalId;
  assetId: CogniteInternalId;
};

export function isValidClassicCadAssetMapping(
  assetMapping: AssetMapping3D
): assetMapping is ClassicCadAssetMapping {
  return assetMapping.treeIndex !== undefined && assetMapping.subtreeSize !== undefined;
}
