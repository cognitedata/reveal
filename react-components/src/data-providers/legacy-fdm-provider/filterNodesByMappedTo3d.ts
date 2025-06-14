import { type AddModelOptions } from '@cognite/reveal';
import { type InstancesWithView } from '../../query/useSearchMappedEquipmentFDM';
import {
  type DmsUniqueIdentifier,
  type EdgeItem,
  type ExternalId,
  type FdmSDK,
  type NodeItem,
  type Source
} from '../FdmSDK';
import {
  type InModel3dEdgeProperties,
  SYSTEM_3D_EDGE_SOURCE,
  SYSTEM_SPACE_3D_SCHEMA
} from './dataModels';
import { getDMSModels } from './getDMSModels';
import { type FdmKey } from '../../components/CacheProvider/types';
import { type QueryRequest } from '@cognite/sdk';
import { getDirectRelationProperties } from '../utils/getDirectRelationProperties';

export async function filterNodesByMappedTo3d(
  fdmSdk: FdmSDK,
  nodesWithViews: InstancesWithView[],
  models: AddModelOptions[],
  spacesToSearch: string[],
  includeIndirectRelations: boolean
): Promise<InstancesWithView[]> {
  const nodes = nodesWithViews.flatMap((result) => result.instances);
  const views = nodesWithViews.map((result) => result.view);

  if (nodes.length === 0) {
    return nodesWithViews;
  }

  const directlyMappedNodes = nodes.flatMap((node) => getDirectRelationProperties(node));

  const mappedEquipmentQuery = createCheckMappedEquipmentQuery(
    nodes,
    directlyMappedNodes,
    models,
    views
  );
  const queryResult = await fdmSdk.queryNodesAndEdges<
    typeof mappedEquipmentQuery,
    [{ source: typeof SYSTEM_3D_EDGE_SOURCE; properties: InModel3dEdgeProperties }]
  >(mappedEquipmentQuery);

  const { mappedEquipmentFirstLevelMap, equipmentSecondLevelMap } = await createMappedEquipmentMaps(
    fdmSdk,
    queryResult.items.mapped_edges,
    models,
    spacesToSearch
  );

  const filteredSearchResults: InstancesWithView[] = [];

  for (const searchResult of nodesWithViews) {
    const filteredInstances = searchResult.instances.filter((instance) =>
      checkInstanceWithMappedEquipmentMaps(
        mappedEquipmentFirstLevelMap,
        equipmentSecondLevelMap,
        instance,
        includeIndirectRelations
      )
    );

    filteredSearchResults.push({ view: searchResult.view, instances: filteredInstances });
  }

  return filteredSearchResults;
}

/* eslint-disable @typescript-eslint/explicit-function-return-type */
function createCheckMappedEquipmentQuery(
  instances: NodeItem[],
  directlyMappedNodes: DmsUniqueIdentifier[],
  models: AddModelOptions[],
  views: Source[],
  limit: number = 1000
) {
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
          nodeFilter: {
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
        sources: [{ source: SYSTEM_3D_EDGE_SOURCE, properties: ['revisionId', 'revisionNodeId'] }]
      },
      mapped_nodes: {
        sources: views.map((view) => ({ source: view, properties: [] }))
      }
    }
  } as const satisfies Omit<QueryRequest, 'cursor' | 'parameters'>;
}

async function createMappedEquipmentMaps(
  fdmSdk: FdmSDK,
  allEdges: EdgeItem[],
  models: AddModelOptions[],
  spacesToSearch: string[]
): Promise<{
  mappedEquipmentFirstLevelMap: Record<string, EdgeItem[]>;
  equipmentSecondLevelMap: Record<string, EdgeItem[]>;
}> {
  const mappedEquipmentFirstLevelMap: Record<string, EdgeItem[]> = {};
  const equipmentSecondLevelMap: Record<string, EdgeItem[]> = {};

  const modelsMap = await createModelsMap(fdmSdk, models);

  for (const edge of allEdges) {
    const { space: endSpace, externalId: endExternalId } = edge.endNode;
    const { space, externalId } = edge.startNode;

    const isModelsMapped = models.some(
      ({ modelId, revisionId }) =>
        modelId.toString() === endExternalId &&
        revisionId.toString() === getRevisionIdFromEdge(edge)
    );

    const modelInstances = modelsMap.get(endExternalId);

    if (modelInstances?.find((model) => model.space === endSpace) !== undefined && isModelsMapped) {
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

function getRevisionIdFromEdge(edge: EdgeItem): string | undefined {
  return (edge.properties as any)?.[SYSTEM_SPACE_3D_SCHEMA]?.[
    `${SYSTEM_3D_EDGE_SOURCE.externalId}/${SYSTEM_3D_EDGE_SOURCE.version}`
  ]?.revisionId?.toString();
}

async function createModelsMap(
  fdmSdk: FdmSDK,
  models: AddModelOptions[]
): Promise<Map<ExternalId, DmsUniqueIdentifier[]>> {
  const modelInstances = await Promise.all(
    models.map(async (model) => await getDMSModels(fdmSdk, model.modelId))
  );
  return new Map(
    modelInstances.map((modelInstanceList, ind) => [`${models[ind].modelId}`, modelInstanceList])
  );
}

function checkInstanceWithMappedEquipmentMaps(
  mappedEquipmentFirstLevelMap: Record<FdmKey, EdgeItem[]>,
  equipmentSecondLevelMap: Record<FdmKey, EdgeItem[]>,
  instance: NodeItem,
  includeIndirectRelations: boolean
): boolean {
  const key: FdmKey = `${instance.space}/${instance.externalId}`;
  const directRelationProperties = getDirectRelationProperties(instance);
  const isMappedFirstLevel = mappedEquipmentFirstLevelMap[key] !== undefined;
  const isSecondLevelWithEdge = equipmentSecondLevelMap[key] !== undefined;
  const isSecondLevelWithDirectRelation = directRelationProperties.length > 0;

  if (isMappedFirstLevel) {
    return true;
  }

  if (isSecondLevelWithEdge && includeIndirectRelations) {
    return equipmentSecondLevelMap[key].some((edge) => {
      const { space, externalId } = edge.endNode;

      const secondLevelKey: FdmKey = `${space}/${externalId}`;
      const isMappedWithEdge = mappedEquipmentFirstLevelMap[secondLevelKey] !== undefined;

      return isMappedWithEdge;
    });
  }

  if (isSecondLevelWithDirectRelation && includeIndirectRelations) {
    const isMappedWithDirectRelation = directRelationProperties.some(
      ({ externalId, space }) =>
        mappedEquipmentFirstLevelMap[`${space}/${externalId}`] !== undefined
    );

    return isMappedWithDirectRelation;
  }

  return false;
}
