/*!
 * Copyright 2023 Cognite AS
 */

import { type Node3D, type CogniteClient, type CogniteExternalId } from '@cognite/sdk';
import {
  type Source,
  type DmsUniqueIdentifier,
  type EdgeItem,
  type FdmSDK
} from '../../utilities/FdmSDK';
import { RevisionFdmNodeCache } from './RevisionFdmNodeCache';
import {
  type FdmEdgeWithNode,
  type FdmCadEdge,
  type ModelRevisionKey,
  type RevisionId,
  type NodeId,
  type ModelNodeIdKey,
  type ModelRevisionToEdgeMap,
  type ModelRevisionId,
  type FdmKey,
  type FdmNodeDataPromises
} from './types';
import {
  createFdmKey,
  createModelNodeIdKey,
  createModelRevisionKey,
  revisionKeyToIds
} from './idAndKeyTranslation';
import {
  type InModel3dEdgeProperties,
  SYSTEM_3D_EDGE_SOURCE,
  SYSTEM_SPACE_3D_SCHEMA
} from '../../utilities/globalDataModels';

import { partition } from 'lodash';

import assert from 'assert';
import { fetchNodesForNodeIds, inspectNodes } from './requests';
import { type ThreeDModelFdmMappings } from '../../hooks/types';

export class FdmNodeCache {
  private readonly _revisionNodeCaches = new Map<ModelRevisionKey, RevisionFdmNodeCache>();

  private readonly _cdfClient: CogniteClient;
  private readonly _fdmClient: FdmSDK;

  private readonly _completeRevisions = new Set<ModelRevisionKey>();

  public constructor(cdfClient: CogniteClient, fdmClient: FdmSDK) {
    this._cdfClient = cdfClient;
    this._fdmClient = fdmClient;
  }

  public async getMappingsForFdmIds(
    externalIds: DmsUniqueIdentifier[],
    modelRevisionIds: ModelRevisionId[]
  ): Promise<ThreeDModelFdmMappings[]> {
    const [cachedModelRevisionIds, nonCachedModelRevisionIds] = partition(
      modelRevisionIds,
      (id) => {
        const revisionKey = createModelRevisionKey(id.modelId, id.revisionId);
        return this._completeRevisions.has(revisionKey);
      }
    );

    const nonCachedModelMappings = await this.getNonCachedModelMappings(
      externalIds,
      nonCachedModelRevisionIds
    );

    const cachedModelMappings = this.getCachedModelMappings(cachedModelRevisionIds, externalIds);

    const combinedList = [...cachedModelMappings, ...nonCachedModelMappings];
    return combinedList;
  }

  private getCachedModelMappings(
    modelRevisionIds: ModelRevisionId[],
    externalIds: DmsUniqueIdentifier[]
  ): ThreeDModelFdmMappings[] {
    const inputExternalIdSet = new Set<FdmKey>(
      externalIds.map((id) => createFdmKey(id.space, id.externalId))
    );

    return modelRevisionIds.map((modelRevisionId) => {
      return this.getCachedModelMappingForRevision(modelRevisionId, inputExternalIdSet);
    });
  }

  private getCachedModelMappingForRevision(
    modelRevisionId: ModelRevisionId,
    relevantFdmKeySet: Set<FdmKey>
  ): ThreeDModelFdmMappings {
    const revisionCache = this.getOrCreateRevisionCache(
      modelRevisionId.modelId,
      modelRevisionId.revisionId
    );

    const relevantCachedEdgeData = intersectWithStartNodeIdSet(
      revisionCache.getAllEdges(),
      relevantFdmKeySet
    );

    const mappings = createMapWithAccumulatedValues(
      relevantCachedEdgeData.map((data) => [data.edge.startNode.externalId, data.cadNode])
    );

    return {
      ...modelRevisionId,
      mappings
    };
  }

  private async getNonCachedModelMappings(
    uniqueIds: DmsUniqueIdentifier[],
    modelRevisions: ModelRevisionId[]
  ): Promise<ThreeDModelFdmMappings[]> {
    if (modelRevisions.length === 0 || uniqueIds.length === 0) {
      return [];
    }

    const fdmKeySet = new Set(uniqueIds.map((id) => createFdmKey(id.space, id.externalId)));

    const revisionToEdgesMap = await this.getAndCacheRevisionToEdgesMap(modelRevisions, false);

    const modelDataPromises = modelRevisions.map(async ({ modelId, revisionId }) => {
      const revisionKey = createModelRevisionKey(modelId, revisionId);
      const edges = revisionToEdgesMap.get(revisionKey);

      return this.getRelevantExternalIdToNodeMapForRevision(
        { modelId, revisionId },
        edges,
        fdmKeySet
      );
    });

    return await Promise.all(modelDataPromises);
  }

  private getRelevantExternalIdToNodeMapForRevision(
    { modelId, revisionId }: ModelRevisionId,
    edges: FdmEdgeWithNode[] | undefined,
    relevantFdmKeySet: Set<FdmKey>
  ): ThreeDModelFdmMappings {
    if (edges === undefined || edges.length === 0)
      return { modelId, revisionId, mappings: new Map<CogniteExternalId, Node3D[]>() };

    const relevantEdges = intersectWithStartNodeIdSet(edges, relevantFdmKeySet);

    const externalIdToNodeMap = createMapWithAccumulatedValues(
      relevantEdges.map((edge) => [edge.edge.startNode.externalId, edge.cadNode])
    );

    return {
      modelId,
      revisionId,
      mappings: externalIdToNodeMap
    };
  }

  public async getAllMappingExternalIds(
    modelRevisionIds: ModelRevisionId[],
    fetchViews: boolean = false
  ): Promise<ModelRevisionToEdgeMap> {
    const [cachedRevisionIds, nonCachedRevisionIds] = partition(modelRevisionIds, (ids) => {
      const key = createModelRevisionKey(ids.modelId, ids.revisionId);
      return this._completeRevisions.has(key);
    });

    if (fetchViews) {
      await this.fetchAllViewsForCachedRevisions(cachedRevisionIds);
    }

    const cachedEdges = cachedRevisionIds.map((id) => this.getCachedEdgesForRevision(id));

    const revisionToEdgesMap = await this.getAndCacheRevisionToEdgesMap(
      nonCachedRevisionIds,
      fetchViews
    );

    cachedEdges.forEach(([revisionKey, edges]) => {
      revisionToEdgesMap.set(revisionKey, edges);
    });

    return revisionToEdgesMap;
  }

  private async fetchAllViewsForCachedRevisions(
    revisions: Array<{
      modelId: number;
      revisionId: number;
    }>
  ): Promise<void> {
    for (const revision of revisions) {
      const revisionCache = this.getOrCreateRevisionCache(revision.modelId, revision.revisionId);

      await revisionCache.fetchViewsForAllEdges();
    }
  }

  private getCachedEdgesForRevision(id: {
    modelId: number;
    revisionId: number;
  }): [ModelRevisionKey, FdmEdgeWithNode[]] {
    const revisionCache = this.getOrCreateRevisionCache(id.modelId, id.revisionId);
    const revisionKey = createModelRevisionKey(id.modelId, id.revisionId);

    const cachedRevisionEdges = revisionCache.getAllEdges();

    return [revisionKey, cachedRevisionEdges];
  }

  private writeRevisionDataToCache(modelMap: Map<ModelRevisionKey, FdmEdgeWithNode[]>): void {
    for (const [revisionKey, data] of modelMap.entries()) {
      const [modelId, revisionId] = revisionKeyToIds(revisionKey);
      const revisionCache = this.getOrCreateRevisionCache(modelId, revisionId);

      data.forEach((edgeAndNode) => {
        revisionCache.insertTreeIndexMappings(edgeAndNode.cadNode.treeIndex, edgeAndNode);
      });

      this._completeRevisions.add(revisionKey);
    }
  }

  private async getAndCacheRevisionToEdgesMap(
    modelRevisionIds: ModelRevisionId[],
    fetchViews: boolean
  ): Promise<Map<ModelRevisionKey, FdmEdgeWithNode[]>> {
    const revisionIds = modelRevisionIds.map((modelRevisionId) => modelRevisionId.revisionId);
    const edges = await this.getEdgesForRevisions(revisionIds, this._fdmClient);

    const edgesWithOptionalViews = fetchViews
      ? await this.getViewsForEdges(edges)
      : edges.map((edge) => ({ edge }));

    const revisionToEdgesMap = await createRevisionToEdgesMap(
      edgesWithOptionalViews,
      modelRevisionIds,
      this._cdfClient
    );

    this.writeRevisionDataToCache(revisionToEdgesMap);

    return revisionToEdgesMap;
  }

  public getClosestParentDataPromises(
    modelId: number,
    revisionId: number,
    treeIndex: number
  ): FdmNodeDataPromises {
    const revisionCache = this.getOrCreateRevisionCache(modelId, revisionId);

    return revisionCache.getClosestParentFdmData(treeIndex);
  }

  private async getViewsForEdges(
    edges: FdmCadEdge[]
  ): Promise<Array<{ edge: FdmCadEdge; view: Source }>> {
    const nodeInspectionResults = await inspectNodes(
      this._fdmClient,
      edges.map((edge) => edge.startNode)
    );

    const dataWithViews = edges.map((edge, ind) => ({
      edge,
      view: nodeInspectionResults.items[ind].inspectionResults.involvedViews[0]
    }));

    return dataWithViews;
  }

  private async getEdgesForRevisions(
    revisionIds: number[],
    fdmClient: FdmSDK
  ): Promise<Array<EdgeItem<InModel3dEdgeProperties>>> {
    if (revisionIds.length === 0) return [];

    const versionedPropertiesKey = `${SYSTEM_3D_EDGE_SOURCE.externalId}/${SYSTEM_3D_EDGE_SOURCE.version}`;
    const filter = {
      in: {
        property: [SYSTEM_SPACE_3D_SCHEMA, versionedPropertiesKey, 'revisionId'],
        values: revisionIds
      }
    };
    const mappings = await fdmClient.filterAllInstances<InModel3dEdgeProperties>(
      filter,
      'edge',
      SYSTEM_3D_EDGE_SOURCE
    );
    return mappings.instances;
  }

  private getOrCreateRevisionCache(modelId: number, revisionId: number): RevisionFdmNodeCache {
    const revisionKey = createModelRevisionKey(modelId, revisionId);

    const revisionCache = this._revisionNodeCaches.get(revisionKey);

    if (revisionCache !== undefined) {
      return revisionCache;
    }

    const newRevisionCache = new RevisionFdmNodeCache(
      this._cdfClient,
      this._fdmClient,
      modelId,
      revisionId
    );

    this._revisionNodeCaches.set(revisionKey, newRevisionCache);

    return newRevisionCache;
  }
}

async function createRevisionToEdgesMap(
  edgesWithViews: Array<{ edge: FdmCadEdge; view?: Source }>,
  modelRevisionIds: ModelRevisionId[],
  cdfClient: CogniteClient
): Promise<Map<ModelRevisionKey, FdmEdgeWithNode[]>> {
  const revisionToNodeIdsMap = createRevisionToNodeIdMap(edgesWithViews);
  const modelNodeIdToNodeMap = await createModelNodeIdToNodeMap(
    revisionToNodeIdsMap,
    modelRevisionIds,
    cdfClient
  );

  return edgesWithViews.reduce((map, edgeWithView) => {
    const edgeRevisionId = edgeWithView.edge.properties.revisionId;
    const modelRevisionId = modelRevisionIds.find((p) => p.revisionId === edgeRevisionId);

    if (modelRevisionId === undefined) return map;

    const value = createFdmEdgeWithNode(
      modelRevisionId,
      modelNodeIdToNodeMap,
      edgeWithView.edge,
      edgeWithView.view
    );

    insertEdgeIntoMapList(value, map, modelRevisionId);

    return map;
  }, new Map<ModelRevisionKey, FdmEdgeWithNode[]>());
}

function createFdmEdgeWithNode(
  modelRevisionId: ModelRevisionId,
  modelNodeIdToNodeMap: Map<ModelNodeIdKey, Node3D>,
  edge: FdmCadEdge,
  view?: Source
): FdmEdgeWithNode {
  const revisionNodeIdKey = createModelNodeIdKey(
    modelRevisionId.modelId,
    modelRevisionId.revisionId,
    edge.properties.revisionNodeId
  );

  const node = modelNodeIdToNodeMap.get(revisionNodeIdKey);
  assert(node !== undefined);

  return { edge, cadNode: node, view };
}

function insertEdgeIntoMapList(
  value: FdmEdgeWithNode,
  map: Map<ModelRevisionKey, FdmEdgeWithNode[]>,
  modelRevisionId: ModelRevisionId
): void {
  const modelRevisionIdKey: ModelRevisionKey = createModelRevisionKey(
    modelRevisionId.modelId,
    modelRevisionId.revisionId
  );

  const edgesForModel = map.get(modelRevisionIdKey);

  if (edgesForModel === undefined) {
    map.set(modelRevisionIdKey, [value]);
  } else {
    edgesForModel.push(value);
  }
}

async function createModelNodeIdToNodeMap(
  revisionToNodeIdsMap: Map<RevisionId, NodeId[]>,
  modelRevisionIds: ModelRevisionId[],
  cdfClient: CogniteClient
): Promise<Map<ModelNodeIdKey, Node3D>> {
  const revisionNodeIdToNode = new Map<ModelNodeIdKey, Node3D>();

  const nodePromises = [...revisionToNodeIdsMap.entries()].map(async ([revisionId, nodeIds]) => {
    const modelId = modelRevisionIds.find((p) => p.revisionId === revisionId)?.modelId;
    assert(modelId !== undefined);

    const nodes = await fetchNodesForNodeIds(modelId, revisionId, nodeIds, cdfClient);
    nodeIds.forEach((nodeId, ind) => {
      const modelNodeIdKey = createModelNodeIdKey(modelId, revisionId, nodeId);
      revisionNodeIdToNode.set(modelNodeIdKey, nodes[ind]);
    });
  });

  await Promise.all(nodePromises);

  return revisionNodeIdToNode;
}

function createRevisionToNodeIdMap(
  edgesWithViews: Array<{ edge: FdmCadEdge; view?: Source }>
): Map<RevisionId, NodeId[]> {
  return edgesWithViews.reduce((revisionNodeIdMap, edgeWithView) => {
    const { revisionNodeId, revisionId } = edgeWithView.edge.properties;

    const nodeIdsInRevision = revisionNodeIdMap.get(revisionId);

    if (nodeIdsInRevision !== undefined) {
      nodeIdsInRevision.push(revisionNodeId);
    } else {
      revisionNodeIdMap.set(revisionId, [revisionNodeId]);
    }

    return revisionNodeIdMap;
  }, new Map<RevisionId, NodeId[]>());
}

function intersectWithStartNodeIdSet(
  edges: FdmEdgeWithNode[],
  relevantFdmKeySet: Set<FdmKey>
): FdmEdgeWithNode[] {
  return edges.filter((edgeData) => {
    const fdmKey = createFdmKey(edgeData.edge.startNode.space, edgeData.edge.startNode.externalId);
    return relevantFdmKeySet.has(fdmKey);
  });
}

function createMapWithAccumulatedValues<K, V>(associations: Array<[K, V]>): Map<K, V[]> {
  return associations.reduce((map, [key, value]) => {
    const prevList = map.get(key);

    if (prevList === undefined) {
      map.set(key, [value]);
    } else {
      prevList.push(value);
    }

    return map;
  }, new Map<K, V[]>());
}
