/*!
 * Copyright 2025 Cognite AS
 */
import { type Asset } from '@cognite/sdk';
import { type AssetProperties } from '../data-providers/core-dm-provider/utils/filters';
import { type FdmNode } from '../data-providers/FdmSDK';
import { createFdmKey } from '../components/CacheProvider/idAndKeyTranslation';
import { AssetInstance } from './instances';

export function assetInstanceToKey(asset: AssetInstance): string {
  if (isDmAsset(asset)) {
    return createFdmKey(asset);
  } else {
    return String(asset.id);
  }
}

function isDmAsset(instance: AssetInstance): instance is FdmNode<AssetProperties> {
  return (
    (instance as FdmNode<AssetProperties>).externalId !== undefined &&
    (instance as FdmNode<AssetProperties>).space !== undefined
  );
}
