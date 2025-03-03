/*!
 * Copyright 2025 Cognite AS
 */
import { AssetMapping3D } from '@cognite/sdk';
import { CdfAssetMapping } from './types';

/**
 * Type guard checking whether the asset mapping contains treeIndex and subtreeSize
 */
export function isCdfAssetMapping(assetMapping: AssetMapping3D): assetMapping is CdfAssetMapping {
  return assetMapping.treeIndex !== undefined && assetMapping.subtreeSize !== undefined;
}
