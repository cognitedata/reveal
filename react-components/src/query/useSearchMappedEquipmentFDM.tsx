/*!
 * Copyright 2023 Cognite AS
 */
import { useMemo } from 'react';
import {
  type NodeItem,
  type FdmSDK,
  type Source,
  type DmsUniqueIdentifier,
  type InstanceFilter
} from '../data-providers/FdmSDK';
import { useFdm3dDataProvider, useFdmSdk } from '../components/RevealCanvas/SDKProvider';
import { type UseQueryResult, useQuery } from '@tanstack/react-query';
import { type AddModelOptions } from '@cognite/reveal';
import { isEqual, uniq, chunk } from 'lodash';
import { type Fdm3dDataProvider } from '../data-providers/Fdm3dDataProvider';
import { removeEmptyProperties } from '../utilities/removeEmptyProperties';

export type InstancesWithView = { view: Source; instances: NodeItem[] };

export const useSearchMappedEquipmentFDM = (
  query: string,
  viewsToSearch: DmsUniqueIdentifier[],
  models: AddModelOptions[],
  instancesFilter: InstanceFilter | undefined,
  limit: number = 100
): UseQueryResult<InstancesWithView[]> => {
  if (limit > 1000) {
    throw new Error('Limit cannot be greater than 1000');
  }

  const fdmSdk = useFdmSdk();
  const fdmDataProvider = useFdm3dDataProvider();

  const spacesToSearch = useMemo(
    () => uniq(viewsToSearch.map((view) => view.space)),
    [viewsToSearch]
  );

  return useQuery({
    queryKey: ['reveal', 'react-components', 'search-mapped-fdm', query, models, viewsToSearch],
    queryFn: async () => {
      if (models.length === 0) {
        return [];
      }

      const sources = await createSourcesFromViews(viewsToSearch, fdmSdk);
      const chunkedSources = chunk(sources, 10);
      if (chunkedSources.length === 0) {
        chunkedSources.push([]);
      }

      const queryResults: InstancesWithView[] = [];

      for (const sourceChunk of chunkedSources) {
        queryResults.push(
          ...(await searchNodesWithViewsAndModels(
            query,
            spacesToSearch,
            sourceChunk,
            models,
            instancesFilter,
            fdmSdk,
            fdmDataProvider,
            limit
          ))
        );
      }
      return queryResults;
    },
    staleTime: Infinity
  });
};

const searchNodesWithViewsAndModels = async (
  query: string,
  spacesToSearch: string[],
  sourcesToSearch: Source[],
  models: AddModelOptions[],
  instancesFilter: InstanceFilter | undefined,
  fdmSdk: FdmSDK,
  fdmDataProvider: Fdm3dDataProvider,
  limit: number = 100
): Promise<InstancesWithView[]> => {
  if (query === '') {
    const nodeItems = await fdmDataProvider.listMappedFdmNodes(
      models,
      sourcesToSearch,
      instancesFilter,
      limit
    );

    const transformedResults = convertQueryNodeItemsToSearchResultsWithViews(nodeItems);

    const combinedWithOtherViews = sourcesToSearch.map((view) => ({
      view,
      instances:
        transformedResults.find(
          (result) => result.view.externalId === view.externalId && result.view.space === view.space
        )?.instances ?? []
    }));

    return combinedWithOtherViews;
  }

  const searchResults: InstancesWithView[] = [];

  for (const view of sourcesToSearch) {
    const result = await fdmSdk.searchInstances(view, query, 'node', limit, instancesFilter);

    searchResults.push({
      view,
      instances: result.instances
    });
  }

  return await fdmDataProvider.filterNodesByMappedTo3d(searchResults, models, spacesToSearch);
};

export const useAllMappedEquipmentFDM = (
  models: AddModelOptions[],
  viewsToSearch: DmsUniqueIdentifier[]
): UseQueryResult<NodeItem[]> => {
  const fdmSdk = useFdmSdk();
  const fdmDataProvider = useFdm3dDataProvider();

  return useQuery({
    queryKey: ['reveal', 'react-components', 'all-mapped-equipment-fdm', viewsToSearch],
    queryFn: async () => {
      const viewSources = await createSourcesFromViews(viewsToSearch, fdmSdk);

      return await fdmDataProvider.listAllMappedFdmNodes(models, viewSources, undefined);
    },
    staleTime: Infinity
  });
};

function convertQueryNodeItemsToSearchResultsWithViews(
  queryItems: NodeItem[]
): InstancesWithView[] {
  return queryItems.reduce<InstancesWithView[]>((acc, fdmNode) => {
    const cleanedNode = removeEmptyProperties(fdmNode);

    Object.keys(cleanedNode.properties).forEach((space) => {
      const currentSpaceProperties = cleanedNode.properties[space];

      const fdmNodeView = Object.keys(currentSpaceProperties)
        .find((key) => !isEqual(currentSpaceProperties[key], {}))
        ?.split('/');

      if (fdmNodeView === undefined || fdmNodeView.length !== 2) {
        return acc;
      }

      const fdmNodeViewExternalId = fdmNodeView[0];
      const fdmNodeViewVersion = fdmNodeView[1];

      const currentSearchResultWithView = acc.find(
        (searchResultsWithView) =>
          searchResultsWithView.view.externalId === fdmNodeViewExternalId &&
          searchResultsWithView.view.space === space
      );

      if (currentSearchResultWithView === undefined) {
        acc.push({
          view: {
            space: cleanedNode.space,
            externalId: fdmNodeViewExternalId,
            version: fdmNodeViewVersion,
            type: 'view'
          },
          instances: [cleanedNode]
        });
        return acc;
      }

      currentSearchResultWithView.instances.push(cleanedNode);
    });

    return acc;
  }, []);
}

async function createSourcesFromViews(
  viewsToSearch: DmsUniqueIdentifier[],
  fdmSdk: FdmSDK
): Promise<Source[]> {
  const dataModelResult = await fdmSdk.listDataModels();
  const viewToVersionMap = new Map<string, string>(
    dataModelResult.items.flatMap((dataModel: any) => {
      return dataModel.views.map(
        (view: Source) => [`${view.space}/${view.externalId}`, view.version] as const
      );
    })
  );

  return viewsToSearch.map((view) => {
    const version = viewToVersionMap.get(`${view.space}/${view.externalId}`);
    if (version === undefined) {
      throw Error(
        `Could not find version for view with space/externalId ${view.space}/${view.externalId}`
      );
    }
    return {
      ...view,
      type: 'view' as const,
      version
    };
  });
}
