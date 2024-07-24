/*!
 * Copyright 2023 Cognite AS
 */

import { type Node3D, type CogniteClient, type CogniteExternalId } from '@cognite/sdk';
import { type Source, type DmsUniqueIdentifier, type FdmSDK } from '../../data-providers/FdmSDK';
import { RevisionFdmNodeCache } from './RevisionFdmNodeCache';
import {
  type FdmConnectionWithNode,
  type FdmCadConnection,
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
} from '../../data-providers/legacy-fdm-provider/dataModels';

import { partition } from 'lodash';

import assert from 'assert';
import { fetchNodesForNodeIds, inspectNodes } from './requests';
import { type ThreeDModelFdmMappings } from '../../hooks/types';
import { fdmEdgesToCadConnections } from '../../data-providers/legacy-fdm-provider/fdmEdgesToCadConnections';
import { Fdm3dDataProvider } from '../../data-providers/Fdm3dDataProvider';

export class FdmNodeCache {
  private readonly _revisionNodeCaches = new Map<ModelRevisionKey, RevisionFdmNodeCache>();

  private readonly _cdfClient: CogniteClient;
  private readonly _fdmClient: FdmSDK;
  private readonly _fdm3dDataProvider: Fdm3dDataProvider;

  private readonly _completeRevisions = new Set<ModelRevisionKey>();

  public constructor(
    cdfClient: CogniteClient,
    fdmClient: FdmSDK,
    fdm3dDataProvider: Fdm3dDataProvider
  ) {
    this._cdfClient = cdfClient;
    this._fdmClient = fdmClient;
    this._fdm3dDataProvider = fdm3dDataProvider;
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
      relevantCachedEdgeData.map((data) => [data.connection.instance.externalId, data.cadNode])
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
    edges: FdmConnectionWithNode[] | undefined,
    relevantFdmKeySet: Set<FdmKey>
  ): ThreeDModelFdmMappings {
    if (edges === undefined || edges.length === 0)
      return { modelId, revisionId, mappings: new Map<CogniteExternalId, Node3D[]>() };

    const relevantEdges = intersectWithStartNodeIdSet(edges, relevantFdmKeySet);

    const externalIdToNodeMap = createMapWithAccumulatedValues(
      relevantEdges.map((edge) => [edge.connection.instance.externalId, edge.cadNode])
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
  }): [ModelRevisionKey, FdmConnectionWithNode[]] {
    const revisionCache = this.getOrCreateRevisionCache(id.modelId, id.revisionId);
    const revisionKey = createModelRevisionKey(id.modelId, id.revisionId);

    const cachedRevisionEdges = revisionCache.getAllEdges();

    return [revisionKey, cachedRevisionEdges];
  }

  private writeRevisionDataToCache(modelMap: Map<ModelRevisionKey, FdmConnectionWithNode[]>): void {
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
  ): Promise<Map<ModelRevisionKey, FdmConnectionWithNode[]>> {
    const revisionIds = modelRevisionIds.map((modelRevisionId) => modelRevisionId.revisionId);
    const connections = await this._fdm3dDataProvider.getCadConnectionsForRevisions(revisionIds);

    const connectionsWithOptionalViews = fetchViews
      ? await this.getViewsForConnections(connections)
      : connections.map((connection) => ({ connection }));

    const revisionToEdgesMap = await createRevisionToEdgesMap(
      connectionsWithOptionalViews,
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

  private async getViewsForConnections(
    connections: FdmCadConnection[]
  ): Promise<Array<{ connection: FdmCadConnection; view: Source }>> {
    const nodeInspectionResults = await inspectNodes(
      this._fdmClient,
      connections.map((connection) => connection.instance)
    );

    const dataWithViews = connections.map((connection, ind) => ({
      connection,
      view: nodeInspectionResults.items[ind].inspectionResults.involvedViews[0]
    }));

    return dataWithViews;
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
      this._fdm3dDataProvider,
      modelId,
      revisionId
    );

    this._revisionNodeCaches.set(revisionKey, newRevisionCache);

    return newRevisionCache;
  }
}

async function createRevisionToEdgesMap(
  connectionsWithView: Array<{ connection: FdmCadConnection; view?: Source }>,
  modelRevisionIds: ModelRevisionId[],
  cdfClient: CogniteClient
): Promise<Map<ModelRevisionKey, FdmConnectionWithNode[]>> {
  const revisionToNodeIdsMap = createRevisionToNodeIdMap(connectionsWithView);
  const modelNodeIdToNodeMap = await createModelNodeIdToNodeMap(
    revisionToNodeIdsMap,
    modelRevisionIds,
    cdfClient
  );

  return connectionsWithView.reduce((map, connectionWithView) => {
    const edgeRevisionId = connectionWithView.connection.revisionId;
    const modelRevisionId = modelRevisionIds.find((p) => p.revisionId === edgeRevisionId);

    if (modelRevisionId === undefined) return map;

    const value = createFdmConnectionWithNode(
      modelRevisionId,
      modelNodeIdToNodeMap,
      connectionWithView.connection,
      connectionWithView.view
    );

    insertConnectionIntoMapList(value, map, modelRevisionId);

    return map;
  }, new Map<ModelRevisionKey, FdmConnectionWithNode[]>());
}

function createFdmConnectionWithNode(
  modelRevisionId: ModelRevisionId,
  modelNodeIdToNodeMap: Map<ModelNodeIdKey, Node3D>,
  connection: FdmCadConnection,
  view?: Source
): FdmConnectionWithNode {
  const revisionNodeIdKey = createModelNodeIdKey(
    modelRevisionId.modelId,
    modelRevisionId.revisionId,
    connection.nodeId
  );

  const node = modelNodeIdToNodeMap.get(revisionNodeIdKey);
  assert(node !== undefined);

  return { connection, cadNode: node, view };
}

function insertConnectionIntoMapList(
  value: FdmConnectionWithNode,
  map: Map<ModelRevisionKey, FdmConnectionWithNode[]>,
  modelRevisionId: ModelRevisionId
): void {
  const modelRevisionIdKey: ModelRevisionKey = createModelRevisionKey(
    modelRevisionId.modelId,
    modelRevisionId.revisionId
  );

  const connectionsForModel = map.get(modelRevisionIdKey);

  if (connectionsForModel === undefined) {
    map.set(modelRevisionIdKey, [value]);
  } else {
    connectionsForModel.push(value);
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
  connections: Array<{ connection: FdmCadConnection; view?: Source }>
): Map<RevisionId, NodeId[]> {
  return connections.reduce((revisionNodeIdMap, connectionWithView) => {
    const { nodeId, revisionId } = connectionWithView.connection;

    const nodeIdsInRevision = revisionNodeIdMap.get(revisionId);

    if (nodeIdsInRevision !== undefined) {
      nodeIdsInRevision.push(nodeId);
    } else {
      revisionNodeIdMap.set(revisionId, [nodeId]);
    }

    return revisionNodeIdMap;
  }, new Map<RevisionId, NodeId[]>());
}

function intersectWithStartNodeIdSet(
  connections: FdmConnectionWithNode[],
  relevantFdmKeySet: Set<FdmKey>
): FdmConnectionWithNode[] {
  return connections.filter((connectionData) => {
    const fdmKey = createFdmKey(
      connectionData.connection.instance.space,
      connectionData.connection.instance.externalId
    );
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
