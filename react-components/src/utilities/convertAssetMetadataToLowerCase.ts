/*!
 * Copyright 2024 Cognite AS
 */
import { type Asset } from '@cognite/sdk';

export function convertAssetMetadataKeysToLowerCase(asset: Asset): Asset {
  return {
    ...asset,
    metadata: Object.fromEntries(
      Object.entries(asset.metadata ?? {}).map(
        ([key, value]) => [key.toLowerCase(), value] as const
      )
    )
  };
}
