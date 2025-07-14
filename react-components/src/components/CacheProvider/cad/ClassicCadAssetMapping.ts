import { type AssetMapping3D, type CogniteInternalId } from '@cognite/sdk';
import { type CadNodeIdData, type CadNodeTreeData } from '../types';

export type ClassicCadAssetMapping = CadNodeIdData & {
  assetId: CogniteInternalId;
};

export type ClassicCadAssetTreeIndexMapping = CadNodeTreeData & {
  assetId: CogniteInternalId;
};

export function isValidClassicCadAssetMapping(
  assetMapping: AssetMapping3D
): assetMapping is ClassicCadAssetMapping {
  return assetMapping.treeIndex !== undefined && assetMapping.subtreeSize !== undefined;
}
