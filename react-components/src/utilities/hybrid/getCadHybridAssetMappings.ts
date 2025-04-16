/*!
 * Copyright 2024 Cognite AS
 */
import { UnitDMSUniqueIdentifier } from '@cognite/sdk';
import { CadModelOptions } from '../../components';
import { COGNITE_ASSET_SOURCE, Source } from '../../data-providers';
import { RevealRenderTarget } from '../../architecture';
import { AssetMappingAndNode3DCache } from '../../components/CacheProvider';
import { InstancesWithView, NodeDefinitionWithModelAndMappings } from '../../query';
import { fetchAllMappedEquipmentAssetMappingsHybrid } from './fetchMappedEquipmentAssetMappingsHybrid';
import { type CdfAssetMapping } from '../../components/CacheProvider/types';
import { isDefined } from './../isDefined';
import { FdmSDK } from '../../data-providers/FdmSDK';

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

  const assetMappingList = await getAllAssetMappingsFromCache(cadModels, assetMappingAndNode3dCache);

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

  const filterAllMappedHybridAssetsForViewsToSearch = filterMappingsPerViewsToSearch(viewsToSearch, allMappedHybridAssets);

  if (query === '' || assetMappingList === undefined) {
    return {
      allHybridAssetMappings: filterAllMappedHybridAssetsForViewsToSearch,
      searchedHybridAssetMappings: undefined
    };
  }

  const instancesWithView = await getHybridAssetMappingsFromSearchQuery(
    viewsToSearch,
    query,
    fdmSdk,
    hybridMappingsIdentifiers
  );

  return {
    allHybridAssetMappings: filterAllMappedHybridAssetsForViewsToSearch,
    searchedHybridAssetMappings: instancesWithView
  };
};

async function getAllAssetMappingsFromCache(cadModels: CadModelOptions[], assetMappingAndNode3dCache: AssetMappingAndNode3DCache): Promise<{
  model: CadModelOptions;
  assetMappings: CdfAssetMapping[];
}[]> {
  const fetchPromises = cadModels.map(
    async (model) =>
      await assetMappingAndNode3dCache
        .getAssetMappingsForModel(model.modelId, model.revisionId)
        .then((assetMappings) => ({ model, assetMappings }))
  );

  return await Promise.all(fetchPromises);
}

function filterMappingsPerViewsToSearch(viewsToSearch: Source[], allMappedHybridAssets: NodeDefinitionWithModelAndMappings[]): NodeDefinitionWithModelAndMappings[] {
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
  return filterAllMappedHybridAssetsForViewsToSearch;

}

async function getHybridAssetMappingsFromSearchQuery(viewsToSearch: Source[], query: string, fdmSdk: FdmSDK, hybridMappingsIdentifiers: UnitDMSUniqueIdentifier[]): Promise<InstancesWithView[]> {
  const limit = 1000;
  const searchResults: InstancesWithView[] = [];

  for await (const view of viewsToSearch) {
    const result = await fdmSdk.searchInstances(view, query, 'node', limit, undefined);

    searchResults.push({
      view,
      instances: result.instances
    });
  }
  return connectMappedInstancesWithSearchResult(searchResults, hybridMappingsIdentifiers);
}

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
