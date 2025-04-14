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
  const assetMappingAndNode3DCache = renderTarget.cdfCaches.assetMappingAndNode3dCache;
  const sdk = renderTarget.rootDomainObject.sdk;
  const fdmSdk = renderTarget.rootDomainObject.fdmSdk;

  const limit = 1000;

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

  if (hybridMappingsIdentifiers.length === 0) return { allHybridAssetMappings: undefined, searchedHybridAssetMappings: undefined };

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
