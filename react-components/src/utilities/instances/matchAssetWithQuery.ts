/*!
 * Copyright 2025 Cognite AS
 */
import { type AssetInstance } from './AssetInstance';
import { isClassicAsset } from './typeGuards';

export function matchAssetWithQuery(assetInstance: AssetInstance, query: string): boolean {
  if (isClassicAsset(assetInstance)) {
    const instance = assetInstance;
    const isInName = instance.name.toLowerCase().includes(query.toLowerCase());
    const isInDescription = instance.description?.toLowerCase().includes(query.toLowerCase());

    return isInName || isInDescription === true;
  } else {
    const isInName = assetInstance.properties.name.toLowerCase().includes(query.toLowerCase());
    const isInDescription = assetInstance.properties.description
      ?.toLowerCase()
      .includes(query.toLowerCase());

    return isInName || isInDescription;
  }
}
