import { type AddModelOptions } from '@cognite/reveal';
import { type AssetMapping3D, type CogniteClient, type ListResponse } from '@cognite/sdk';
import { type ModelMappingsWithAssets } from '../useSearchMappedEquipmentAssetMappings';
import { chunk } from 'lodash';

const MODELS_MAPPING_CHUNK_SIZE = 5;

export async function getAssetsFromAssetMappings(
  sdk: CogniteClient,
  modelsMappings: Array<{ model: AddModelOptions; mappings: ListResponse<AssetMapping3D[]> }>
): Promise<ModelMappingsWithAssets[]> {
  const mappingsWithAssets: ModelMappingsWithAssets[] = [];

  for (const modelsMappingsChunk of chunk(modelsMappings, MODELS_MAPPING_CHUNK_SIZE)) {
    const mappingsWithAssetsPromises = modelsMappingsChunk.map(async ({ mappings, model }) => {
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

    mappingsWithAssets.concat(await Promise.all(mappingsWithAssetsPromises));
  }

  return mappingsWithAssets;
}
