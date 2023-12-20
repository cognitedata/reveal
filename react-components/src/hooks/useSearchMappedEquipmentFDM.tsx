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
import { useSDK } from '../components/RevealContainer/SDKProvider';
import { type UseQueryResult, useQuery } from '@tanstack/react-query';
import {
  SYSTEM_3D_EDGE_SOURCE,
  INSTANCE_SPACE_3D_DATA,
  SYSTEM_SPACE_3D_SCHEMA
} from '../utilities/globalDataModels';
import { type AddModelOptions } from '@cognite/reveal';
import { isEqual, uniq } from 'lodash';

export type SeachResultsWithView = { view: Source; instances: NodeItem[] };

type FdmKey = `${Space}/${ExternalId}`;

export const useSearchMappedEquipmentFDM = (
  query: string,
  viewsToSearch: DmsUniqueIdentifier[],
  models: AddModelOptions[],
  instancesFilter: any,
  limit: number = 100,
  userSdk?: CogniteClient
): UseQueryResult<SeachResultsWithView[]> => {
  if (limit > 1000) {
    throw new Error('Limit cannot be greater than 1000');
  }

  const sdk = useSDK(userSdk);
  const fdmSdk = useMemo(() => new FdmSDK(sdk), [sdk]);

  const spacesToSearch = useMemo(
    () => uniq(viewsToSearch.map((view) => view.space)),
    [viewsToSearch]
  );

  return useQuery(
    ['reveal', 'react-components', 'search-mapped-fdm', query, models, viewsToSearch],
    async () => {
      const viewsWithVersion = await createSourcesFromViews(viewsToSearch, fdmSdk);

      if (models.length === 0 || viewsToSearch.length === 0) {
        return [];
      }

      if (query === '') {
        const result = await fdmSdk.queryNodesAndEdges(
          createMappedEquipmentQuery(models, viewsWithVersion, limit)
        );

        const transformedResults = convertQueryNodeItemsToSearchResultsWithViews(
          result.items.mapped_nodes.concat(result.items.mapped_nodes_2) as NodeItem[]
        );

        const combinedWithOtherViews = viewsWithVersion.map((view) => ({
          view,
          instances:
            transformedResults.find(
              (result) =>
                result.view.externalId === view.externalId && result.view.space === view.space
            )?.instances ?? []
        }));

        return combinedWithOtherViews;
      }

      const searchResults: SeachResultsWithView[] = [];

      for (const view of viewsWithVersion) {
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
    },
    { staleTime: Infinity }
  );
};

export const useAllMappedEquipmentFDM = (
  models: AddModelOptions[],
  viewsToSearch: DmsUniqueIdentifier[],
  userSdk?: CogniteClient
): UseQueryResult<NodeItem[]> => {
  const sdk = useSDK(userSdk);

  const fdmSdk = useMemo(() => new FdmSDK(sdk), [sdk]);

  return useQuery(
    ['reveal', 'react-components', 'all-mapped-equipment-fdm', viewsToSearch],
    async () => {
      const viewSources = await createSourcesFromViews(viewsToSearch, fdmSdk);
      const query = createMappedEquipmentQuery(models, viewSources, 10000);

      let currentPage = await fdmSdk.queryNodesAndEdges(query);

      const mappedNodes = currentPage.items.mapped_nodes as NodeItem[];
      const mappedNodesParents = currentPage.items.mapped_nodes_2 as NodeItem[];
      const mappedEquipment = mappedNodes
        .concat(mappedNodesParents)
        .map((node) => removeEmptyProperties(node));

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

      return mappedEquipment;
    },
    { staleTime: Infinity }
  );
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

function createMappedEquipmentMaps(
  allEdges: EdgeItem[],
  models: AddModelOptions[],
  spacesToSearch: string[]
): {
  mappedEquipmentFirstLevelMap: Record<string, EdgeItem[]>;
  equipmentSecondLevelMap: Record<string, EdgeItem[]>;
} {
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

    if (endSpace === INSTANCE_SPACE_3D_DATA && isModelsMapped) {
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
  searchResults: SeachResultsWithView[],
  models: AddModelOptions[],
  spacesToSearch: string[]
): Promise<SeachResultsWithView[]> {
  const filteredSearchResults: SeachResultsWithView[] = [];

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

  const { mappedEquipmentFirstLevelMap, equipmentSecondLevelMap } = createMappedEquipmentMaps(
    queryResult.items.mapped_edges as EdgeItem[],
    models,
    spacesToSearch
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
    dataModelResult.items.flatMap((dataModel: any) =>
      dataModel.views.map(
        (view: Source) => [`${view.space}/${view.externalId}`, view.version] as const
      )
    )
  );

  return viewsToSearch.map((view) => ({
    ...view,
    type: 'view' as const,
    version: viewToVersionMap.get(`${view.space}/${view.externalId}`) ?? ''
  }));
}
