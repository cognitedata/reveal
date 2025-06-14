import { useCallback, useMemo } from 'react';
import {
  type NodeItem,
  type FdmSDK,
  type Source,
  type InstanceFilter,
  type SimpleSource,
  type ViewItem
} from '../data-providers/FdmSDK';
import { useFdmSdk } from '../components/RevealCanvas/SDKProvider';
import { type UseQueryResult, useQuery, useQueryClient } from '@tanstack/react-query';
import { type DataSourceType, type AddModelOptions } from '@cognite/reveal';
import { isEqual, uniq, chunk } from 'lodash';
import { type Fdm3dDataProvider } from '../data-providers/Fdm3dDataProvider';
import { removeEmptyProperties } from '../utilities/removeEmptyProperties';
import { getModelKeys } from '../utilities/getModelKeys';
import { useFdm3dDataProvider } from '../components/CacheProvider/CacheProvider';
import { type AddImage360CollectionDatamodelsOptions } from '../components/Reveal3DResources/types';
import { assetsInstanceFilterWithHasDataQuery } from '../data-providers/core-dm-provider/assetsInstanceFilterWithHasDataQuery';
import { transformViewItemToSource } from '../data-providers/core-dm-provider/utils/transformViewItemToSource';

export type InstancesWithView<PropertyType = Record<string, unknown>> = {
  view: Source;
  instances: Array<NodeItem<PropertyType>>;
};

export type InstancesWithViewDefinition<PropertyType = Record<string, unknown>> = {
  view: ViewItem;
  instances: Array<NodeItem<PropertyType>>;
};

export const useSearchMappedEquipmentFDM = (
  query: string,
  viewsToSearch: SimpleSource[],
  models: Array<AddModelOptions<DataSourceType> | AddImage360CollectionDatamodelsOptions>,
  instancesFilter: InstanceFilter | undefined,
  limit: number = 100
): UseQueryResult<InstancesWithView[]> => {
  if (limit > 1000) {
    throw new Error('Limit cannot be greater than 1000');
  }

  const fdmSdk = useFdmSdk();
  const fdmDataProvider = useFdm3dDataProvider();
  const queryClient = useQueryClient();

  const spacesToSearch = useMemo(
    () => uniq(viewsToSearch.map((view) => view.space)),
    [viewsToSearch]
  );
  const modelKeys = useMemo(() => getModelKeys(models), [models]);

  return useQuery({
    queryKey: [
      'reveal',
      'react-components',
      'search-mapped-fdm',
      query,
      modelKeys,
      viewsToSearch,
      instancesFilter,
      limit
    ],
    queryFn: async () => {
      if (models.length === 0) {
        return [];
      }

      const viewDefinitions = await fetchViewDefinitions(queryClient, fdmSdk, viewsToSearch);

      const chunkedViews = chunk(viewDefinitions, 10);
      if (chunkedViews.length === 0) {
        chunkedViews.push([]);
      }

      const queryResults: InstancesWithView[] = [];

      for (const sourceChunk of chunkedViews) {
        const chunkResult = await searchNodesWithViewsAndModels(
          query,
          spacesToSearch,
          sourceChunk,
          models,
          instancesFilter,
          fdmSdk,
          fdmDataProvider,
          limit
        );
        queryResults.push(...chunkResult);
      }

      return queryResults;
    },
    staleTime: Infinity
  });
};

export function useFilterNodesByMappedToModelsCallback(
  models: Array<AddModelOptions<DataSourceType> | AddImage360CollectionDatamodelsOptions>,
  viewToSearch: SimpleSource,
  includeIndirectRelations: boolean
): (identifiers: NodeItem[]) => Promise<NodeItem[]> {
  const fdmDataProvider = useFdm3dDataProvider();

  const fdmSdk = useFdmSdk();
  const queryClient = useQueryClient();

  return useCallback(
    async (nodes: NodeItem[]) => {
      const viewDefinitions = await fetchViewDefinitions(queryClient, fdmSdk, [viewToSearch]);

      const filterResult = await fdmDataProvider.filterNodesByMappedTo3d(
        [{ instances: nodes, view: viewDefinitions[0] }],
        models,
        [viewToSearch.space],
        includeIndirectRelations
      );

      return filterResult.flatMap((result) => result.instances);
    },
    [includeIndirectRelations, models, viewToSearch, fdmDataProvider, fdmSdk, queryClient]
  );
}

const searchNodesWithViewsAndModels = async (
  query: string,
  spacesToSearch: string[],
  sourcesToSearch: ViewItem[],
  models: Array<AddModelOptions<DataSourceType> | AddImage360CollectionDatamodelsOptions>,
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
      view: transformViewItemToSource(view),
      instances:
        transformedResults.find(
          (result) => result.view.externalId === view.externalId && result.view.space === view.space
        )?.instances ?? []
    }));

    return combinedWithOtherViews;
  }

  const searchResults: InstancesWithViewDefinition[] = [];

  for (const view of sourcesToSearch) {
    const result = await fdmSdk.searchInstances(
      transformViewItemToSource(view),
      query,
      'node',
      limit,
      instancesFilter
    );

    searchResults.push({
      view,
      instances: result.instances
    });
  }

  return await fdmDataProvider.filterNodesByMappedTo3d(searchResults, models, spacesToSearch, true);
};

export const useAllMappedEquipmentFDM = (
  models: Array<AddModelOptions<DataSourceType> | AddImage360CollectionDatamodelsOptions>,
  viewsToSearch: SimpleSource[],
  enabled: boolean = true
): UseQueryResult<NodeItem[]> => {
  const fdmDataProvider = useFdm3dDataProvider();

  return useQuery({
    queryKey: ['reveal', 'react-components', 'all-mapped-equipment-fdm', viewsToSearch, models],
    queryFn: async () => {
      const viewSources = createSourcesFromViews(viewsToSearch);

      const assetFilterForAllMapped = assetsInstanceFilterWithHasDataQuery(viewSources);
      return await fdmDataProvider.listAllMappedFdmNodes(
        models,
        viewSources,
        assetFilterForAllMapped
      );
    },
    staleTime: Infinity,
    enabled
  });
};

function convertQueryNodeItemsToSearchResultsWithViews(
  queryItems: NodeItem[]
): InstancesWithView[] {
  return queryItems.reduce<InstancesWithView[]>((acc, fdmNode) => {
    const cleanedNode = removeEmptyProperties(fdmNode);

    Object.keys(cleanedNode.properties).forEach((nodeViewSpace) => {
      const currentSpaceProperties = cleanedNode.properties[nodeViewSpace];

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
          searchResultsWithView.view.space === nodeViewSpace
      );

      if (currentSearchResultWithView === undefined) {
        acc.push({
          view: {
            space: nodeViewSpace,
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

function createSourcesFromViews(viewsToSearch: SimpleSource[]): Source[] {
  return viewsToSearch.map((view) => ({
    ...view,
    type: 'view'
  }));
}

async function fetchViewDefinitions(
  queryClient: ReturnType<typeof useQueryClient>,
  fdmSdk: FdmSDK,
  viewsToSearch: SimpleSource[]
): Promise<ViewItem[]> {
  return await queryClient.fetchQuery({
    queryKey: [
      'reveal',
      'react-components',
      'search-mapped-fdm',
      'get-view-definitions-from-simple-source',
      viewsToSearch
    ],
    queryFn: async () => {
      const chunkedSources = chunk(viewsToSearch, 1000);
      const views: ViewItem[] = [];
      for (const chunk of chunkedSources) {
        const res = await fdmSdk.getViewsByIds(createSourcesFromViews(chunk));
        views.push(...res.items);
      }
      return views;
    }
  });
}
