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
  type Query,
  type DmsUniqueIdentifier,
  type Space,
  type ExternalId
} from '../utilities/FdmSDK';
import { useSDK } from '../components/RevealCanvas/SDKProvider';
import { type UseQueryResult, useQuery } from '@tanstack/react-query';
import { SYSTEM_3D_EDGE_SOURCE, SYSTEM_SPACE_3D_SCHEMA } from '../utilities/globalDataModels';
import { type AddModelOptions } from '@cognite/reveal';
import { isEqual, uniq, chunk } from 'lodash';
import { getDMSModel } from '../components/CacheProvider/requests';

export type SearchResultsWithView = { view: Source; instances: NodeItem[] };

type FdmKey = `${Space}/${ExternalId}`;

export const useSearchMappedEquipmentFDM = (
  query: string,
  viewsToSearch: DmsUniqueIdentifier[],
  models: AddModelOptions[],
  instancesFilter: any,
  limit: number = 100,
  userSdk?: CogniteClient
): UseQueryResult<SearchResultsWithView[]> => {
  if (limit > 1000) {
    throw new Error('Limit cannot be greater than 1000');
  }

  const sdk = useSDK(userSdk);
  const fdmSdk = useMemo(() => new FdmSDK(sdk), [sdk]);

  const spacesToSearch = useMemo(
    () => uniq(viewsToSearch.map((view) => view.space)),
    [viewsToSearch]
  );

  return useQuery({
    queryKey: ['reveal', 'react-components', 'search-mapped-fdm', query, models, viewsToSearch],
    queryFn: async () => {
      if (models.length === 0 || viewsToSearch.length === 0) {
        return [];
      }

      const sources = await createSourcesFromViews(viewsToSearch, fdmSdk);
      const chunkedSources = chunk(sources, 10);

      const queryResults: SearchResultsWithView[] = [];

      for (const sourceChunk of chunkedSources) {
        queryResults.push(
          ...(await searchNodesWithViewsAndModels(
            query,
            spacesToSearch,
            sourceChunk,
            models,
            instancesFilter,
            fdmSdk,
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
  instancesFilter: any,
  fdmSdk: FdmSDK,
  limit: number = 100
): Promise<SearchResultsWithView[]> => {
  if (query === '') {
    const result = await fdmSdk.queryNodesAndEdges(
      createMappedEquipmentQuery(models, sourcesToSearch, limit)
    );

    const transformedResults = convertQueryNodeItemsToSearchResultsWithViews(
      result.items.mapped_nodes.concat(result.items.mapped_nodes_2) as NodeItem[]
    );

    const combinedWithOtherViews = sourcesToSearch.map((view) => ({
      view,
      instances:
        transformedResults.find(
          (result) => result.view.externalId === view.externalId && result.view.space === view.space
        )?.instances ?? []
    }));

    return combinedWithOtherViews;
  }

  const searchResults: SearchResultsWithView[] = [];

  for (const view of sourcesToSearch) {
    const result = await fdmSdk.searchInstances(view, query, 'node', limit, instancesFilter);

    searchResults.push({
      view,
      instances: result.instances
    });
  }
  const filteredSearchResults = await filterSearchResultsByMappedTo3DModels(
    fdmSdk,
    searchResults,
    models,
    spacesToSearch
  );

  return filteredSearchResults;
};

export const useAllMappedEquipmentFDM = (
  models: AddModelOptions[],
  viewsToSearch: DmsUniqueIdentifier[],
  userSdk?: CogniteClient
): UseQueryResult<NodeItem[]> => {
  const sdk = useSDK(userSdk);

  const fdmSdk = useMemo(() => new FdmSDK(sdk), [sdk]);

  return useQuery({
    queryKey: ['reveal', 'react-components', 'all-mapped-equipment-fdm', viewsToSearch],
    queryFn: async () => {
      const viewSources = await createSourcesFromViews(viewsToSearch, fdmSdk);
      const queries = createChunkedMappedEquipmentQueries(models, viewSources, 10000);

      const mappedEquipment: NodeItem[] = [];
      for (const query of queries) {
        let currentPage = await fdmSdk.queryNodesAndEdges(query);

        const mappedNodes = currentPage.items.mapped_nodes as NodeItem[];
        const mappedNodesParents = currentPage.items.mapped_nodes_2 as NodeItem[];
        mappedEquipment.push(
          ...mappedNodes.concat(mappedNodesParents).map((node) => removeEmptyProperties(node))
        );

        while (!isEqual(currentPage.nextCursor, {})) {
          query.cursors = currentPage.nextCursor;

          currentPage = await fdmSdk.queryNodesAndEdges(query);

          const cleanedNodes = currentPage.items.mapped_nodes.map((node) =>
            removeEmptyProperties(node as NodeItem)
          );
          const cleanedNodesParents = currentPage.items.mapped_nodes_2.map((node) =>
            removeEmptyProperties(node as NodeItem)
          );

          mappedEquipment.push(...cleanedNodes.concat(cleanedNodesParents));
        }
      }

      return mappedEquipment;
    },
    staleTime: Infinity
  });
};

function removeEmptyProperties(queryResultNode: NodeItem): NodeItem {
  Object.keys(queryResultNode.properties).forEach((space) => {
    const currentSpaceProperties = queryResultNode.properties[space];
    const newProperties: Record<string, Record<string, unknown>> = {};

    Object.keys(currentSpaceProperties).forEach((view) => {
      const currentViewProperties = currentSpaceProperties[view];

      if (Object.keys(currentViewProperties).length !== 0) {
        newProperties[view] = currentViewProperties;
      }
    });

    queryResultNode.properties[space] = newProperties;
  });

  return queryResultNode;
}

function convertQueryNodeItemsToSearchResultsWithViews(
  queryItems: NodeItem[]
): SearchResultsWithView[] {
  return queryItems.reduce<SearchResultsWithView[]>((acc, fdmNode) => {
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

async function createMappedEquipmentMaps(
  allEdges: EdgeItem[],
  models: AddModelOptions[],
  spacesToSearch: string[],
  fdmSdk: FdmSDK
): Promise<{
  mappedEquipmentFirstLevelMap: Record<string, EdgeItem[]>;
  equipmentSecondLevelMap: Record<string, EdgeItem[]>;
}> {
  const mappedEquipmentFirstLevelMap: Record<string, EdgeItem[]> = {};
  const equipmentSecondLevelMap: Record<string, EdgeItem[]> = {};

  for (const edge of allEdges) {
    const { space: endSpace, externalId: endExternalId } = edge.endNode;
    const { space, externalId } = edge.startNode;

    const isModelsMapped = models.some(
      ({ modelId, revisionId }) =>
        modelId.toString() === endExternalId &&
        revisionId.toString() === getRevisionIdFromEdge(edge)
    );

    const modelInstance = await getDMSModel(parseInt(endExternalId), fdmSdk);

    if (endSpace === modelInstance.space && isModelsMapped) {
      const key = `${space}/${externalId}`;

      const keyEdges = mappedEquipmentFirstLevelMap[key];
      mappedEquipmentFirstLevelMap[key] = keyEdges !== undefined ? keyEdges.concat(edge) : [edge];
      continue;
    }

    if (spacesToSearch.includes(endSpace)) {
      const key = `${space}/${externalId}`;

      const keyEdges = equipmentSecondLevelMap[key];

      equipmentSecondLevelMap[key] = keyEdges !== undefined ? keyEdges.concat(edge) : [edge];
      continue;
    }
  }

  return { mappedEquipmentFirstLevelMap, equipmentSecondLevelMap };
}

function createCheckMappedEquipmentQuery(
  instances: NodeItem[],
  directlyMappedNodes: DmsUniqueIdentifier[],
  models: AddModelOptions[],
  views: Source[],
  limit: number = 1000
): Query {
  return {
    with: {
      mapped_nodes: {
        nodes: {
          filter: {
            in: {
              property: ['node', 'externalId'],
              values: instances
                .map((instance) => instance.externalId)
                .concat(directlyMappedNodes.map((node) => node.externalId))
            }
          }
        },
        limit
      },
      mapped_edges: {
        edges: {
          from: 'mapped_nodes',
          direction: 'outwards',
          terminationFilter: {
            in: {
              property: ['node', 'externalId'],
              values: models.map((model) => model.modelId.toString())
            }
          },
          maxDistance: 2
        },
        limit: 10000
      }
    },
    select: {
      mapped_edges: {
        sources: [{ source: SYSTEM_3D_EDGE_SOURCE, properties: [] }]
      },
      mapped_nodes: {
        sources: views.map((view) => ({ source: view, properties: [] }))
      }
    }
  };
}

function createChunkedMappedEquipmentQueries(
  models: AddModelOptions[],
  views: Source[],
  limit: number = 10000,
  cursors?: Record<string, string>
): Query[] {
  const viewChunks = chunk(views, 10);
  return viewChunks.map((viewChunk) =>
    createMappedEquipmentQuery(models, viewChunk, limit, cursors)
  );
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
      },
      mapped_edges_2: {
        edges: {
          from: 'mapped_nodes',
          direction: 'inwards',
          maxDistance: 1
        }
      },
      mapped_nodes_2: {
        nodes: {
          from: 'mapped_edges_2',
          chainTo: 'destination'
        }
      }
    },
    cursors,
    select: {
      mapped_nodes_2: {
        sources: views.map((view) => ({ source: view, properties: [] }))
      },
      mapped_edges_2: {},
      mapped_edges: {
        sources: [{ source: SYSTEM_3D_EDGE_SOURCE, properties: [] }]
      },
      mapped_nodes: {
        sources: views.map((view) => ({ source: view, properties: [] }))
      }
    }
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
  searchResults: SearchResultsWithView[],
  models: AddModelOptions[],
  spacesToSearch: string[]
): Promise<SearchResultsWithView[]> {
  const filteredSearchResults: SearchResultsWithView[] = [];

  const searchResultsNodes = searchResults.flatMap((result) => result.instances);
  const searchResultsViews = searchResults.map((result) => result.view);
  const directlyMappedNodes = searchResultsNodes
    .map((node) => getDirectRelationProperties(node))
    .flat();

  if (searchResultsNodes.length === 0) {
    return searchResults;
  }

  const mappedEquipmentQuery = createCheckMappedEquipmentQuery(
    searchResultsNodes,
    directlyMappedNodes,
    models,
    searchResultsViews
  );
  const queryResult = await fdmSdk.queryNodesAndEdges(mappedEquipmentQuery);

  const { mappedEquipmentFirstLevelMap, equipmentSecondLevelMap } = await createMappedEquipmentMaps(
    queryResult.items.mapped_edges as EdgeItem[],
    models,
    spacesToSearch,
    fdmSdk
  );

  for (const searchResult of searchResults) {
    const filteredInstances = searchResult.instances.filter((instance) =>
      checkInstanceWithMappedEquipmentMaps(
        mappedEquipmentFirstLevelMap,
        equipmentSecondLevelMap,
        instance
      )
    );

    filteredSearchResults.push({ view: searchResult.view, instances: filteredInstances });
  }

  return filteredSearchResults;
}

function checkInstanceWithMappedEquipmentMaps(
  mappedEquipmentFirstLevelMap: Record<FdmKey, EdgeItem[]>,
  equipmentSecondLevelMap: Record<FdmKey, EdgeItem[]>,
  instance: NodeItem
): boolean {
  const key: FdmKey = `${instance.space}/${instance.externalId}`;
  const directRelationProperties = getDirectRelationProperties(instance);
  const isMappedFirstLevel = mappedEquipmentFirstLevelMap[key] !== undefined;
  const isSecondLevelWithEdge = equipmentSecondLevelMap[key] !== undefined;
  const isSecondLevelWithDirectRelation = directRelationProperties.length > 0;

  if (isMappedFirstLevel) {
    return true;
  }

  if (isSecondLevelWithEdge) {
    return equipmentSecondLevelMap[key].some((edge) => {
      const { space, externalId } = edge.endNode;

      const secondLevelKey: FdmKey = `${space}/${externalId}`;
      const isMappedWithEdge = mappedEquipmentFirstLevelMap[secondLevelKey] !== undefined;

      return isMappedWithEdge;
    });
  }

  if (isSecondLevelWithDirectRelation) {
    const isMappedWithDirectRelation = directRelationProperties.some(
      ({ externalId, space }) =>
        mappedEquipmentFirstLevelMap[`${space}/${externalId}`] !== undefined
    );

    return isMappedWithDirectRelation;
  }

  return false;
}

function getRevisionIdFromEdge(edge: EdgeItem): string | undefined {
  return (edge.properties as any)?.[SYSTEM_SPACE_3D_SCHEMA]?.[
    `${SYSTEM_3D_EDGE_SOURCE.externalId}/${SYSTEM_3D_EDGE_SOURCE.version}`
  ]?.revisionId?.toString();
}

function getDirectRelationProperties(searchResultNode: NodeItem): DmsUniqueIdentifier[] {
  const directRelations: DmsUniqueIdentifier[] = [];
  const nodeProperties = searchResultNode.properties;

  Object.keys(nodeProperties).forEach((propertyKey) => {
    const { space, externalId } = nodeProperties[propertyKey] as any;

    if (space !== undefined && externalId !== undefined) {
      directRelations.push({ space, externalId });
    }
  });

  return directRelations;
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
