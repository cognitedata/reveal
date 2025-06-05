import { AddModelOptions, ClassicDataSourceType } from '@cognite/reveal';
import { SearchClassicCadAssetsResponse } from './types';
import { CogniteClient } from '@cognite/sdk';
import { getAssetsFromAssetMappings } from './getAssetsFromAssetMappings';
import { ModelMappingsWithAssets } from '../useSearchMappedEquipmentAssetMappings';

type CursorForModel = {
  cursor: string | undefined;
  model: AddModelOptions<ClassicDataSourceType>;
};

export async function fetchAllAssetsForCadModels(
  models: AddModelOptions<ClassicDataSourceType>[],
  limit: number,
  cursor: string | undefined,
  sdk: CogniteClient
): Promise<SearchClassicCadAssetsResponse> {
  const firstPage = cursor === undefined;
  const currentPagesOfAssetMappingsPromises = models.map(async (model) => {
    const cursorForModel =
      cursor === undefined
        ? undefined
        : (JSON.parse(cursor) as CursorForModel[]).find(
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

  const nextCursor = JSON.stringify(getNextPageParam(modelsAssetMappings));
  return {
    nextCursor,
    data: modelsAssetMappings.flatMap((mapping) => mapping.assets)
  };
}

function getNextPageParam(lastPage: ModelMappingsWithAssets[]): CursorForModel[] {
  return lastPage
    .map(({ mappings, model }) => ({ cursor: mappings.nextCursor, model }))
    .filter((mappingModel) => mappingModel.cursor !== undefined);
}
