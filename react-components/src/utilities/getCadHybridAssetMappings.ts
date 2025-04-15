/*!
 * Copyright 2024 Cognite AS
 */
import { UnitDMSUniqueIdentifier } from '@cognite/sdk';
import { CadModelOptions } from '../components';
import { COGNITE_ASSET_SOURCE, Source } from '../data-providers';
import { RevealRenderTarget } from '../architecture';
import { InstancesWithView, NodeDefinitionWithModelAndMappings } from '../query';
import { fetchAllMappedEquipmentAssetMappingsHybrid } from './fetchMappedEquipmentAssetMappings';
import { isDefined } from './isDefined';

type AllHybridMappingsAndSearchResult = {
  allHybridAssetMappings: NodeDefinitionWithModelAndMappings[] | undefined;
  searchedHybridAssetMappings: InstancesWithView[] | undefined;
};

export const getCadHybridAssetMappings = async (
  cadModels: CadModelOptions[],
  viewsToSearch: Source[],
  query: string,
  renderTarget: RevealRenderTarget,
): Promise<AllHybridMappingsAndSearchResult> => {
  const { cdfCaches, rootDomainObject } = renderTarget;
  const { assetMappingAndNode3dCache } = cdfCaches;
  const { sdk, fdmSdk } = rootDomainObject;

  const limit = 1000;

  const fetchPromises = cadModels.map(
    async (model) =>
      await assetMappingAndNode3dCache
        .getAssetMappingsForModel(model.modelId, model.revisionId)
        .then((assetMappings) => ({ model, assetMappings }))
  );

  const assetMappingList = await Promise.all(fetchPromises);

  const hybridMappingsIdentifiers = assetMappingList.flatMap((item) =>
    item.assetMappings.map((mapping) => mapping.assetInstanceId).filter(isDefined)
  );

  if (hybridMappingsIdentifiers.length === 0) return { allHybridAssetMappings: undefined, searchedHybridAssetMappings: undefined };

  const allMappedHybridAssets = await fetchAllMappedEquipmentAssetMappingsHybrid({
    sdk,
    viewToSearch: COGNITE_ASSET_SOURCE,
    assetMappingList,
    hybridMappingsIdentifiers
  });

  const filterAllMappedHybridAssetsForViewsToSearch = viewsToSearch.flatMap(
    (view) => {
      const viewExternalIdWithVersion = `${view.externalId}/${view.version}`;
      const viewSpace = view.space;
      return allMappedHybridAssets.filter((item) => {
        const properties = item.asset.properties as Record<string, Record<string, unknown>> | undefined;
        return properties?.[viewSpace]?.[viewExternalIdWithVersion];
      });
    }
  );

  if (query === '' || assetMappingList === undefined) {
    return {
      allHybridAssetMappings: filterAllMappedHybridAssetsForViewsToSearch,
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
    allHybridAssetMappings: filterAllMappedHybridAssetsForViewsToSearch,
    searchedHybridAssetMappings: instancesWithView
  };
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
