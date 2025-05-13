/*!
 * Copyright 2025 Cognite AS
 */
import { type NodeDefinition, type CogniteClient } from '@cognite/sdk';
import { type NodeDefinitionWithModelAndMappings, type ModelMappingsWithAssets } from '../../query';
import { DmsUniqueIdentifier, type SimpleSource } from '../../data-providers';
import { type ModelWithAssetMappings } from '../../hooks';

export const fetchAllMappedEquipmentAssetMappingsHybrid = async ({
  sdk,
  viewToSearch,
  assetMappingList,
  hybridMappingsIdentifiers
}: {
  sdk: CogniteClient;
  viewToSearch: SimpleSource;
  assetMappingList: ModelWithAssetMappings[];
  hybridMappingsIdentifiers: DmsUniqueIdentifier[];
}): Promise<NodeDefinitionWithModelAndMappings[]> => {
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
    items: hybridMappingsIdentifiers.map((instance) => ({
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
