/*!
 * Copyright 2025 Cognite AS
 */
import { type AddModelOptions } from '@cognite/reveal';
import { type CogniteClient, type ListResponse, type AssetMapping3D } from '@cognite/sdk';
import { type ModelMappingsWithAssets } from '../query';

export async function getAssetsFromAssetMappings(
  sdk: CogniteClient,
  modelsMappings: Array<{ model: AddModelOptions; mappings: ListResponse<AssetMapping3D[]> }>
): Promise<ModelMappingsWithAssets[]> {
  const mappingsWithAssetsPromises = modelsMappings.map(async ({ mappings, model }) => {
    if (mappings.items.length === 0) {
      return { model, assets: [], mappings };
    }

    const deduplicatedAssetIds = Array.from(
      new Set(mappings.items.map((mapping) => mapping.assetId))
    );
    const assetIdObjects = deduplicatedAssetIds.map((id) => ({ id }));

    const assets = await sdk.assets.retrieve(assetIdObjects, { ignoreUnknownIds: true });

    return { model, assets, mappings };
  });

  const mappingsWithAssets = await Promise.all(mappingsWithAssetsPromises);

  return mappingsWithAssets;
}
