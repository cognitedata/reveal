/*!
 * Copyright 2024 Cognite AS
 */
import { useQuery, type UseQueryResult } from '@tanstack/react-query';
import { type CadModelOptions } from '../../components';
import { type ModelWithAssetMappings } from './ModelWithAssetMappings';
import { useAssetMappingAndNode3DCache } from '../../components/CacheProvider/CacheProvider';
import { useIsCoreDmOnly } from '../useIsCoreDmOnly';
import { useFdmSdk, useSDK } from '../../components/RevealCanvas/SDKProvider';
import { isDefined } from '../../utilities/isDefined';
import { useMemo } from 'react';
import { createFdmKey, createModelRevisionKey } from '../../components/CacheProvider/idAndKeyTranslation';
import { fetchAllMappedEquipmentAssetMappingsHybrid } from '../../utilities/fetchMappedEquipmentAssetMappings';
import { COGNITE_ASSET_SOURCE, Source } from '../../data-providers';
import { InstancesWithView, NodeDefinitionWithModelAndMappings } from '../../query';
import { UnitDMSUniqueIdentifier } from '@cognite/sdk';

type AllHybridMappingsAndSearchResult = {
  allHybridAssetMappings: NodeDefinitionWithModelAndMappings[] | undefined;
  searchedHybridAssetMappings: InstancesWithView[] | undefined;
};

export const useGetCadHybridAssetMappings = (
  cadModels: CadModelOptions[],
  viewsToSearch: Source[],
  query: string,
): UseQueryResult<AllHybridMappingsAndSearchResult> => {
  const assetMappingAndNode3DCache = useAssetMappingAndNode3DCache();

  const isCoreDmOnly = useIsCoreDmOnly();

  const sdk = useSDK();
  const fdmSdk = useFdmSdk();

  const limit = 1000;

  return useQuery({
    queryKey: [
      'reveal',
      'react-components',
      'hybrid-asset-mappings',
      viewsToSearch.map((view) => `${view.space}/${view.externalId}`).sort(),
      query,
      ...cadModels.map((model) => `${model.modelId}/${model.revisionId}`).sort()
    ],
    queryFn: async () => {
      const fetchPromises = cadModels.map(
        async (model) =>
          await assetMappingAndNode3DCache
            .getAssetMappingsForModel(model.modelId, model.revisionId)
            .then((assetMappings) => ({ model, assetMappings }))
      );

      const assetMappingList = await Promise.all(fetchPromises);

      const hybridMappingsIdentifiers = assetMappingList.flatMap((item) =>
        item.assetMappings.map((mapping) => mapping.assetInstanceId).filter(isDefined)
      );

      if (hybridMappingsIdentifiers.length === 0) return [];

      const allMappedHybridAssets = await fetchAllMappedEquipmentAssetMappingsHybrid({
        sdk,
        viewToSearch: COGNITE_ASSET_SOURCE,
        assetMappingList,
        hybridMappingsIdentifiers
      });

      if (query === '' || assetMappingList === undefined) {
        return {
          allHybridAssetMappings: allMappedHybridAssets,
          searchedHybridAssetMappings: undefined
        };
      }

      const searchResults: InstancesWithView[] = [];

      for await (const view of viewsToSearch) {
        const result = await fdmSdk.searchInstances(view, query, 'node', limit, undefined);

        searchResults.push({
          view,
          instances: result.instances
        });
      }
      const instancesWithView = connectMappedInstancesWithSearchResult(searchResults, hybridMappingsIdentifiers);

      return {
        allHybridAssetMappings: allMappedHybridAssets,
        searchedHybridAssetMappings: instancesWithView
      };
    },
    staleTime: Infinity,
    enabled: cadModels.length > 0 && !isCoreDmOnly
  });
};

function connectMappedInstancesWithSearchResult(
  searchResults: InstancesWithView[],
  mapped3dCDMAssetIdentifiers: UnitDMSUniqueIdentifier[]
): InstancesWithView[] {
  const filteredResults = searchResults.map((result) => {
    const filteredInstances = result.instances.filter((instance) =>
      mapped3dCDMAssetIdentifiers.find(
        (mappedItem) =>
          mappedItem.space === instance.space && mappedItem.externalId === instance.externalId
      )
    );
    return {
      view: result.view,
      instances: filteredInstances
    };
  });

  return filteredResults;
}
