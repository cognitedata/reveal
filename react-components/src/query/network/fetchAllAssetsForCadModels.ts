import { type AddModelOptions, type ClassicDataSourceType } from '@cognite/reveal';
import { type SearchClassicCadAssetsResponse } from './types';
import { AssetMapping3D, type CogniteClient } from '@cognite/sdk';
import { getAssetsFromAssetMappings } from './getAssetsFromAssetMappings';
import { type ModelMappingsWithAssets } from '../useSearchMappedEquipmentAssetMappings';
import { isSameModel } from '../../utilities/isSameModel';
import { chunk } from 'lodash';

const MODEL_CHUNK_SIZE = 5;

type CursorForModel = {
  cursor: string | undefined;
  model: AddModelOptions<ClassicDataSourceType>;
};

type AssetMappingsWithModel = {
  mappings: { items: AssetMapping3D[] };
  model: AddModelOptions<ClassicDataSourceType>;
};

export async function fetchAllAssetsForCadModels(
  models: Array<AddModelOptions<ClassicDataSourceType>>,
  limit: number,
  cursor: string | undefined,
  sdk: CogniteClient
): Promise<SearchClassicCadAssetsResponse> {
  const cursorsForModels =
    cursor === undefined ? undefined : (JSON.parse(cursor) as CursorForModel[]);

  const firstPage = cursorsForModels === undefined;

  const modelChunks = chunk(models, MODEL_CHUNK_SIZE);

  const currentPagesOfAssetMappings: Array<{
    mappings: { items: AssetMapping3D[] };
    model: AddModelOptions<ClassicDataSourceType>;
  }> = [];

  for (const modelChunk of modelChunks) {
    const modelChunkAssetMappingPromises = modelChunk.map((model) =>
      fetchAssetMappingsForModel(model, cursorsForModels, firstPage, limit, sdk)
    );

    const modelChunkAssetMappings = await Promise.all(modelChunkAssetMappingPromises);

    currentPagesOfAssetMappings.push(...modelChunkAssetMappings);
  }

  const assetMappingResult = await getAssetsFromAssetMappings(sdk, currentPagesOfAssetMappings);

  const modelWithNextCursors = getNextCursors(assetMappingResult);

  const serializedNextCursors = modelWithNextCursors.some(
    (modelWithCursor) => modelWithCursor.cursor !== undefined
  )
    ? JSON.stringify(modelWithNextCursors)
    : undefined;

  return {
    nextCursor: serializedNextCursors,
    data: assetMappingResult.flatMap((mapping) => mapping.assets)
  };
}

function getNextCursors(lastPage: ModelMappingsWithAssets[]): CursorForModel[] {
  return lastPage
    .map(({ mappings, model }) => ({ cursor: mappings.nextCursor, model }))
    .filter((mappingModel) => mappingModel.cursor !== undefined);
}

async function fetchAssetMappingsForModel(
  model: AddModelOptions<ClassicDataSourceType>,
  cursorsForModels: CursorForModel[] | undefined,
  isFirstPage: boolean,
  limit: number,
  sdk: CogniteClient
): Promise<AssetMappingsWithModel> {
  const cursorForModel = cursorsForModels?.find((nextCursor) =>
    isSameModel(nextCursor.model, model)
  )?.cursor;

  if (!isFirstPage && cursorForModel === undefined) {
    return { mappings: { items: [] }, model };
  }

  const mappings = await sdk.assetMappings3D
    .filter(model.modelId, model.revisionId, {
      cursor: cursorForModel,
      limit
    })
    .autoPagingToArray();

  return { mappings: { items: mappings }, model };
}
