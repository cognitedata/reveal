import { type AssetMapping3D } from '@cognite/sdk';

import { CogniteInternalId } from '@cognite/sdk';
import { DmsUniqueIdentifier } from '../../../data-providers';

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
