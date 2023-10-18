/*!
 * Copyright 2023 Cognite AS
 */
import { type CogniteClient } from '@cognite/sdk';
import { useMemo } from 'react';
import {
  type EdgeItem,
  type NodeItem,
  FdmSDK,
  type Source,
  type ViewItem,
  type Query
} from '../utilities/FdmSDK';
import { useSDK } from '../components/RevealContainer/SDKProvider';
import { type UseQueryResult, useQuery } from '@tanstack/react-query';
import { SYSTEM_3D_EDGE_SOURCE, SYSTEM_3D_NODE_TYPE } from '../utilities/globalDataModels';
import { type AddModelOptions } from '@cognite/reveal';
import { isEqual } from 'lodash';

export type SeachResultsWithView = { view: Source; instances: NodeItem[] };

export const useSearchMappedEquipmentFDM = (
  query: string,
  spacesToSearch: string[],
  models: AddModelOptions[],
  limit: number = 100,
  userSdk?: CogniteClient
): UseQueryResult<SeachResultsWithView[]> => {
  if (limit > 1000) {
    throw new Error('Limit cannot be greater than 1000');
  }

  const sdk = useSDK(userSdk);

  const fdmSdk = useMemo(() => new FdmSDK(sdk), [sdk]);

  const viewsToSearchPromise: Promise<Source[]> = useMemo(
    async () => await getViewsToSearch(fdmSdk, spacesToSearch),
    [spacesToSearch, fdmSdk]
  );

  return useQuery(
    ['reveal', 'react-components', 'search-mapped-fdm', query, models, viewsToSearchPromise],
    async () => {
      const viewsToSearch = await viewsToSearchPromise;

      if (query === '') {
        const result = await fdmSdk.queryNodesAndEdges(
          createMappedEquipmentQuery(models, viewsToSearch, limit)
        );

        const transformedResults = convertQueryNodeItemsToSearchResultsWithViews(
          result.items.mapped_nodes
        );

        return transformedResults;
      }

      const searchResults: SeachResultsWithView[] = [];

      for (const view of viewsToSearch) {
        const result = await fdmSdk.searchInstances(view, query, 'node', limit);

        searchResults.push({
          view,
          instances: result.instances.map((nodeItem) => removeEmptyProperties(nodeItem))
        });
      }

      const filteredSearchResults = await filterSearchResultsByMappedTo3DModels(
        fdmSdk,
        searchResults,
        models
      );

      return filteredSearchResults;
    },
    { staleTime: Infinity }
  );
};

export const useAllMappedEquipmentFDM = (
  models: AddModelOptions[],
  spacesToSearch: string[],
  userSdk?: CogniteClient
): UseQueryResult<NodeItem[]> => {
  const sdk = useSDK(userSdk);

  const fdmSdk = useMemo(() => new FdmSDK(sdk), [sdk]);

  const viewsToSearchPromise: Promise<Source[]> = useMemo(
    async () => await getViewsToSearch(fdmSdk, spacesToSearch),
    [spacesToSearch, fdmSdk]
  );

  return useQuery(
    ['reveal', 'react-components', 'all-mapped-equipment-fdm', spacesToSearch],
    async () => {
      const viewsToSearch = await viewsToSearchPromise;
      const query = createMappedEquipmentQuery(models, viewsToSearch, 10000);

      let currentPage = await fdmSdk.queryNodesAndEdges(query);

      const mappedEquipment = currentPage.items.mapped_nodes.map((node) =>
        removeEmptyProperties(node)
      );

      while (!isEqual(currentPage.nextCursor, {})) {
        query.cursors = currentPage.nextCursor;

        currentPage = await fdmSdk.queryNodesAndEdges(query);

        for (const node of currentPage.items.mapped_nodes) {
          const cleanedNode = removeEmptyProperties(node);

          mappedEquipment.push(cleanedNode);
        }
      }

      return mappedEquipment;
    },
    { staleTime: Infinity }
  );
};

function removeEmptyProperties(node: NodeItem): NodeItem {
  Object.keys(node.properties).forEach((space) => {
    const currentSpaceProperties = node.properties[space];
    const newProperties: Record<string, Record<string, unknown>> = {};

    Object.keys(currentSpaceProperties).forEach((view) => {
      const currentViewProperties = currentSpaceProperties[view];

      if (Object.keys(currentViewProperties).length !== 0) {
        newProperties[view] = currentViewProperties;
      }
    });

    node.properties[space] = newProperties;
  });

  return node;
}

async function getViewsToSearch(fdmSdk: FdmSDK, spacesToSearch: string[]): Promise<Source[]> {
  const viewsPromises = spacesToSearch.map(async (space, index) => {
    const isUnique = spacesToSearch.findIndex((spaceToSearch) => spaceToSearch === space) === index;

    if (!isUnique) {
      return [];
    }

    const viewsInSpace = await fdmSdk.listViews(space);

    const mapped3DViews = viewsInSpace.views.filter((view) => {
      const isImplementing3DEntity = view.implements.some(
        (view) => view.externalId === SYSTEM_3D_NODE_TYPE.externalId
      );

      return isImplementing3DEntity;
    });

    return convertViewItemsToSource(mapped3DViews);
  });

  const views = await Promise.all(viewsPromises);

  return views.flat();
}

function convertQueryNodeItemsToSearchResultsWithViews(
  queryItems: NodeItem[]
): SeachResultsWithView[] {
  return queryItems.reduce<SeachResultsWithView[]>((acc, fdmNode) => {
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

function convertViewItemsToSource(viewItems: ViewItem[]): Source[] {
  return viewItems.map((viewItem) => ({
    space: viewItem.space,
    type: 'view',
    version: viewItem.version,
    externalId: viewItem.externalId
  }));
}

function createMappedEquipmentMap(mappedEdges: EdgeItem[]): Record<string, boolean> {
  const mappedEquipmentMap: Record<string, boolean> = {};

  mappedEdges.forEach((edge) => {
    const { space, externalId } = edge.startNode;
    const key = `${space}/${externalId}`;

    mappedEquipmentMap[key] = true;
  });

  return mappedEquipmentMap;
}

function createMappedEquipmentQuery(
  models: AddModelOptions[],
  views: Source[],
  limit: number = 10000,
  cursors?: Record<string, string>
): Query {
  return {
    with: {
      mapped_edges: {
        edges: {
          filter: createInModelsFilter(models)
        },
        limit
      },
      mapped_nodes: {
        nodes: {
          from: 'mapped_edges',
          chainTo: 'source'
        },
        limit
      }
    },
    cursors,
    select: {
      mapped_edges: {
        sources: [
          {
            source: SYSTEM_3D_EDGE_SOURCE,
            properties: []
          }
        ]
      },
      mapped_nodes: {
        sources: views.map((view) => ({ source: view, properties: [] }))
      }
    }
  };
}

function createIsMappedFilter(instances: NodeItem[], models: AddModelOptions[]): { and: any[] } {
  return {
    and: [
      {
        in: {
          property: ['edge', 'startNode'],
          values: instances.map((instance) => ({
            space: instance.space,
            externalId: instance.externalId
          }))
        }
      },
      createInModelsFilter(models)
    ]
  };
}

function createInModelsFilter(models: AddModelOptions[]): { in: any } {
  return {
    in: {
      property: [
        SYSTEM_3D_EDGE_SOURCE.space,
        `${SYSTEM_3D_EDGE_SOURCE.externalId}/${SYSTEM_3D_EDGE_SOURCE.version}`,
        'revisionId'
      ],
      values: models.map((model) => model.revisionId)
    }
  };
}

async function filterSearchResultsByMappedTo3DModels(
  fdmSdk: FdmSDK,
  searchResults: SeachResultsWithView[],
  models: AddModelOptions[]
): Promise<SeachResultsWithView[]> {
  const filteredSearchResults: SeachResultsWithView[] = [];

  for (const searchResult of searchResults) {
    if (searchResult.instances.length === 0) {
      continue;
    }

    const isMappedFilter = createIsMappedFilter(searchResult.instances, models);
    const mappedEdges = await fdmSdk.filterAllInstances(
      isMappedFilter,
      'edge',
      SYSTEM_3D_EDGE_SOURCE
    );

    const mappedEquipmentMap = createMappedEquipmentMap(mappedEdges.instances);
    const filteredInstances = searchResult.instances.filter((instance) => {
      const key = `${instance.space}/${instance.externalId}`;
      return mappedEquipmentMap[key] !== undefined;
    });

    filteredSearchResults.push({ view: searchResult.view, instances: filteredInstances });
  }

  return filteredSearchResults;
}
