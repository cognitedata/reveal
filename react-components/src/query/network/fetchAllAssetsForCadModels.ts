import { type AddModelOptions, type ClassicDataSourceType } from '@cognite/reveal';
import { type SearchClassicCadAssetsResponse } from './types';
import { type CogniteClient } from '@cognite/sdk';
import { getAssetsFromAssetMappings } from './getAssetsFromAssetMappings';
import { fetchAllHybridAssetMappingsForModels } from './fetchAllHybridAssetMappingsForModels';

export type CursorForModel = {
  cursor: string | undefined;
  model: AddModelOptions<ClassicDataSourceType>;
};

export async function fetchAllAssetsForCadModels(
  models: Array<AddModelOptions<ClassicDataSourceType>>,
  limit: number,
  cursorsForModels: CursorForModel[] | undefined,
  sdk: CogniteClient
): Promise<SearchClassicCadAssetsResponse> {
  const currentPagesOfAssetMappings = await fetchAllHybridAssetMappingsForModels<'classic'>(
    'classic',
    models,
    limit,
    cursorsForModels,
    sdk
  );

  const assetMappingResult = await getAssetsFromAssetMappings(
    sdk,
    currentPagesOfAssetMappings.items
  );

  const modelWithNextCursors = currentPagesOfAssetMappings.nextCursors;

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
