/*!
 * Copyright 2025 Cognite AS
 */
import { type AddModelOptions } from '@cognite/reveal';
import { type NodeDefinition, type CogniteClient } from '@cognite/sdk';
import { type NodeDefinitionWithModelAndMappings, type ModelMappingsWithAssets } from '../query';
import { getAssetsFromAssetMappings } from './getAssetsFromAssetMappings';
import { type SimpleSource } from '../data-providers';
import { type ModelWithAssetMappings } from '../hooks';
import { isDefined } from './isDefined';

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

export const fetchAllMappedEquipmentAssetMappingsHybrid = async ({
  sdk,
  viewToSearch,
  assetMappingList
}: {
  sdk: CogniteClient;
  viewToSearch: SimpleSource;
  assetMappingList: ModelWithAssetMappings[];
}): Promise<NodeDefinitionWithModelAndMappings[]> => {
  const instances = assetMappingList.flatMap((mapping) =>
    mapping.assetMappings.map((item) => item.assetInstanceId).filter(isDefined)
  );

  if (instances.length === 0) return [];

  const allEquipment = await sdk.instances.retrieve({
    sources: [
      {
        source: {
          externalId: viewToSearch.externalId,
          space: viewToSearch.space,
          type: 'view',
          version: viewToSearch.version
        }
      }
    ],
    items: instances.map((instance) => ({
      instanceType: 'node',
      space: instance.space,
      externalId: instance.externalId
    }))
  });

  const modelsWithCoreAssetsAndMappings: NodeDefinitionWithModelAndMappings[] = [];

  assetMappingList.forEach((mapping) => {
    allEquipment?.items.forEach((equipment) => {
      if (equipment.instanceType !== 'node') return;

      const mappingsFound = mapping.assetMappings.filter(
        (item) =>
          item.assetInstanceId?.externalId === equipment.externalId &&
          item.assetInstanceId?.space === equipment.space
      );
      if (mappingsFound.length > 0) {
        const assetNode: NodeDefinition = {
          space: equipment.space,
          externalId: equipment.externalId,
          instanceType: 'node',
          properties: equipment.properties ?? {},
          version: equipment.version,
          createdTime: equipment.createdTime,
          lastUpdatedTime: equipment.lastUpdatedTime
        };

        modelsWithCoreAssetsAndMappings.push({
          model: mapping.model,
          asset: assetNode,
          mappings: mappingsFound
        });
      }
    });
  });

  return modelsWithCoreAssetsAndMappings;
};
