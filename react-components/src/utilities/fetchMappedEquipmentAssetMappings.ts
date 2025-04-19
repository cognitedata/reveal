/*!
 * Copyright 2025 Cognite AS
 */
import { type AddModelOptions } from '@cognite/reveal';
import { type CogniteClient } from '@cognite/sdk';
import { type ModelMappingsWithAssets } from '../query';
import { getAssetsFromAssetMappings } from './getAssetsFromAssetMappings';

export const fetchAllMappedEquipmentAssetMappingsClassic = async (
  sdk: CogniteClient,
  models: AddModelOptions[],
  pageParam: Array<{
    cursor: string | undefined;
    model: AddModelOptions;
  }>
): Promise<ModelMappingsWithAssets[]> => {
  const currentPagesOfAssetMappingsClassicPromises = models.map(async (model) => {
    const nextCursors = pageParam as Array<{
      cursor: string | 'start' | undefined;
      model: AddModelOptions;
    }>;
    const nextCursor = nextCursors.find(
      (nextCursor) =>
        nextCursor.model.modelId === model.modelId &&
        nextCursor.model.revisionId === model.revisionId
    )?.cursor;
    if (nextCursor === undefined) {
      return { mappings: { items: [] }, model };
    }

    const filterQueryClassic = {
      cursor: nextCursor === 'start' ? undefined : nextCursor,
      limit: 1000
    };

    const mappings = await sdk.assetMappings3D.filter(
      model.modelId,
      model.revisionId,
      filterQueryClassic
    );

    return { mappings, model };
  });

  const currentPagesOfAssetMappingsClassic = await Promise.all(
    currentPagesOfAssetMappingsClassicPromises
  );

  const modelsAssets = await getAssetsFromAssetMappings(sdk, currentPagesOfAssetMappingsClassic);

  return modelsAssets;
};
