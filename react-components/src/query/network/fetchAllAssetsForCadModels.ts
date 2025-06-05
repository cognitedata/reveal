import { type AddModelOptions, type ClassicDataSourceType } from '@cognite/reveal';
import { type SearchClassicCadAssetsResponse } from './types';
import { type CogniteClient } from '@cognite/sdk';
import { getAssetsFromAssetMappings } from './getAssetsFromAssetMappings';
import { type ModelMappingsWithAssets } from '../useSearchMappedEquipmentAssetMappings';

type CursorForModel = {
  cursor: string | undefined;
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

  const currentPagesOfAssetMappingsPromises = models.map(async (model) => {
    const cursorForModel = cursorsForModels?.find(
      (nextCursor) =>
        nextCursor.model.modelId === model.modelId &&
        nextCursor.model.revisionId === model.revisionId
    )?.cursor;

    if (!firstPage && cursorForModel === undefined) {
      return { mappings: { items: [] }, model };
    }

    const mappings = await sdk.assetMappings3D.filter(model.modelId, model.revisionId, {
      cursor: cursorForModel,
      limit
    });

    return { mappings, model };
  });

  const currentPagesOfAssetMappings = await Promise.all(currentPagesOfAssetMappingsPromises);

  const modelsAssetMappings = await getAssetsFromAssetMappings(sdk, currentPagesOfAssetMappings);

  const modelWithNextCursors = getNextCursors(modelsAssetMappings);

  const serializedNextCursors = modelWithNextCursors.some(
    (modelWithCursor) => modelWithCursor.cursor !== undefined
  )
    ? JSON.stringify(modelWithNextCursors)
    : undefined;

  return {
    nextCursor: serializedNextCursors,
    data: modelsAssetMappings.flatMap((mapping) => mapping.assets)
  };
}

function getNextCursors(lastPage: ModelMappingsWithAssets[]): CursorForModel[] {
  return lastPage
    .map(({ mappings, model }) => ({ cursor: mappings.nextCursor, model }))
    .filter((mappingModel) => mappingModel.cursor !== undefined);
}
