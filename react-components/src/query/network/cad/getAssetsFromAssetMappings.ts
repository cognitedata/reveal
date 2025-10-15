import { type AddModelOptions } from '@cognite/reveal';
import { type CogniteClient, type ListResponse } from '@cognite/sdk';
import { type ClassicCadModelMappingsWithAssets } from '../../useSearchMappedEquipmentAssetMappings';
import { chunk } from 'lodash-es';
import { type ClassicCadAssetMapping } from '../../../components/CacheProvider/cad/assetMappingTypes';

const MODELS_MAPPING_CHUNK_SIZE = 10;

export async function getAssetsFromAssetMappings(
  sdk: CogniteClient,
  modelsMappings: Array<{
    model: AddModelOptions;
    mappings: ListResponse<ClassicCadAssetMapping[]>;
  }>
): Promise<ClassicCadModelMappingsWithAssets[]> {
  const mappingsWithAssets: ClassicCadModelMappingsWithAssets[] = [];

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

    mappingsWithAssets.push(...(await Promise.all(mappingsWithAssetsPromises)));
  }

  return mappingsWithAssets;
}
