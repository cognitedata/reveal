/*!
 * Copyright 2023 Cognite AS
 */

import { type Node3D, type CogniteClient } from '@cognite/sdk';
import { type EdgeItem, type FdmSDK } from '../../utilities/FdmSDK';
import { RevisionFdmNodeCache } from './RevisionFdmNodeCache';
import {
  type FdmEdgeWithNode,
  type Fdm3dNodeData,
  type FdmCadEdge,
  type RevisionKey,
  type RevisionTreeIndex,
  type FdmKey,
  type FdmId,
  type RevisionId,
  type NodeId,
  type ModelNodeIdKey,
  type ModelId
} from './types';
import {
  type InModel3dEdgeProperties,
  SYSTEM_3D_EDGE_SOURCE,
  SYSTEM_SPACE_3D_SCHEMA
} from '../../utilities/globalDataModels';

import { partition } from 'lodash';

import assert from 'assert';
import { fetchNodesForNodeIds } from './requests';

export type ModelRevisionKey = `${number}-${number}`;
export type ModelRevisionToEdgeMap = Map<ModelRevisionKey, FdmEdgeWithNode[]>;

export class FdmNodeCache {
  private readonly _revisionNodeCaches = new Map<RevisionKey, RevisionFdmNodeCache>();

  private readonly _cdfClient: CogniteClient;
  private readonly _fdmClient: FdmSDK;

  private readonly _completeRevisions = new Set<RevisionKey>();

  public constructor(cdfClient: CogniteClient, fdmClient: FdmSDK) {
    this._cdfClient = cdfClient;
    this._fdmClient = fdmClient;
  }

  public async getAllMappingExternalIds(
    modelRevisionIds: Array<{ modelId: number; revisionId: number }>
  ): Promise<ModelRevisionToEdgeMap> {
    const [cachedRevisionIds, nonCachedRevisionIds] = partition(modelRevisionIds, (ids) => {
      const key = createRevisionKey(ids.modelId, ids.revisionId);
      return this._completeRevisions.has(key);
    });

    const cachedEdges = cachedRevisionIds.map((id) => this.getCachedEdgesForRevision(id));

    const revisionToEdgesMap = await this.getRevisionToEdgesMap(nonCachedRevisionIds);

    this.writeRevisionDataToCache(revisionToEdgesMap);

    cachedEdges.forEach(([revisionKey, edges]) => {
      revisionToEdgesMap.set(revisionKey, edges);
    });

    return revisionToEdgesMap;
  }

  private getCachedEdgesForRevision(id: {
    modelId: number;
    revisionId: number;
  }): [RevisionKey, FdmEdgeWithNode[]] {
    const revisionCache = this.getOrCreateRevisionCache(id.modelId, id.revisionId);
    const revisionKey = createRevisionKey(id.modelId, id.revisionId);
    const cachedRevisionEdges = revisionCache.getAllEdges();
    return [revisionKey, cachedRevisionEdges];
  }

  private writeRevisionDataToCache(modelMap: Map<RevisionKey, FdmEdgeWithNode[]>): void {
    for (const [revisionKey, data] of modelMap.entries()) {
      const [modelId, revisionId] = revisionKeyToIds(revisionKey);
      const revisionCache = this.getOrCreateRevisionCache(modelId, revisionId);

      data.forEach((edgeAndNode) => {
        revisionCache.insertTreeIndexMappings(edgeAndNode.node.treeIndex, edgeAndNode);
      });

      this._completeRevisions.add(revisionKey);
    }
  }

  private async getRevisionToEdgesMap(
    modelRevisionIds: Array<{ modelId: number; revisionId: number }>
  ): Promise<Map<RevisionKey, FdmEdgeWithNode[]>> {
    const revisionIds = modelRevisionIds.map((modelRevisionId) => modelRevisionId.revisionId);
    const edges = await this.getEdgesForRevisions(revisionIds, this._fdmClient);
    return await groupToModelRevision(edges, modelRevisionIds, this._cdfClient);
  }

  public async getClosestParentExternalId(
    modelId: number,
    revisionId: number,
    treeIndex: number
  ): Promise<Fdm3dNodeData[]> {
    const revisionCache = this.getOrCreateRevisionCache(modelId, revisionId);

    return await revisionCache.getClosestParentFdmData(treeIndex);
  }

  private async getEdgesForRevisions(
    revisionIds: number[],
    fdmClient: FdmSDK
  ): Promise<Array<EdgeItem<InModel3dEdgeProperties>>> {
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
    return mappings.edges;
  }

  private getOrCreateRevisionCache(modelId: number, revisionId: number): RevisionFdmNodeCache {
    const revisionKey = createRevisionKey(modelId, revisionId);

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

function createRevisionKey(modelId: number, revisionId: number): RevisionKey {
  return `${modelId}-${revisionId}`;
}

function revisionKeyToIds(revisionKey: RevisionKey): [number, number] {
  const components = revisionKey.split('-');
  return [Number(components[0]), Number(components[1])];
}

export function createRevisionTreeIndex(
  modelId: number,
  revisionId: number,
  treeIndex: number
): RevisionTreeIndex {
  return `${modelId}-${revisionId}-${treeIndex}`;
}

export function createFdmKey(spaceId: string, externalId: string): FdmKey {
  return `${spaceId}-${externalId}`;
}

export function fdmKeyToId(fdmKey: FdmKey): FdmId {
  const parts = fdmKey.split('-');

  return { space: parts[0], externalId: parts[1] };
}

export function insertIntoSetMap<T, U>(key: T, value: U, globalMap: Map<T, U[]>): void {
  const prevVal = globalMap.get(key);

  if (prevVal === undefined) {
    globalMap.set(key, [value]);
    return;
  }

  prevVal.push(value);
}

async function groupToModelRevision(
  edges: FdmCadEdge[],
  modelRevisionIds: Array<{ modelId: number; revisionId: number }>,
  cdfClient: CogniteClient
): Promise<Map<RevisionKey, FdmEdgeWithNode[]>> {
  const revisionToNodeIdsMap = createRevisionToNodeIdMap(edges);
  const modelNodeIdToNodeMap = await createModelNodeIdToNodeMap(
    revisionToNodeIdsMap,
    modelRevisionIds,
    cdfClient
  );

  return edges.reduce((map, edge) => {
    const edgeRevisionId = edge.properties.revisionId;
    const modelRevisionId = modelRevisionIds.find((p) => p.revisionId === edgeRevisionId);

    if (modelRevisionId === undefined) return map;

    const value = createFdmEdgeWithNode(modelRevisionId, edge, modelNodeIdToNodeMap);

    insertEdgeIntoMapList(value, map, modelRevisionId);

    return map;
  }, new Map<ModelRevisionKey, FdmEdgeWithNode[]>());
}

function createFdmEdgeWithNode(
  modelRevisionId: { modelId: number; revisionId: number },
  edge: FdmCadEdge,
  modelNodeIdToNodeMap: Map<ModelNodeIdKey, Node3D>
): FdmEdgeWithNode {
  const revisionNodeIdKey =
    `${modelRevisionId.modelId}-${modelRevisionId.revisionId}-${edge.properties.revisionNodeId}` as const;

  const node = modelNodeIdToNodeMap.get(revisionNodeIdKey);
  assert(node !== undefined);

  return { edge, node };
}

function insertEdgeIntoMapList(
  value: FdmEdgeWithNode,
  map: Map<ModelRevisionKey, FdmEdgeWithNode[]>,
  modelRevisionId: { modelId: number; revisionId: number }
): void {
  const modelRevisionIdKey: ModelRevisionKey = createRevisionKey(
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
  modelRevisionIds: Array<{ modelId: ModelId; revisionId: RevisionId }>,
  cdfClient: CogniteClient
): Promise<Map<ModelNodeIdKey, Node3D>> {
  const revisionNodeIdToNode = new Map<ModelNodeIdKey, Node3D>();

  const nodePromises = [...revisionToNodeIdsMap.entries()].map(async ([revisionId, nodeIds]) => {
    const modelId = modelRevisionIds.find((p) => p.revisionId === revisionId)?.modelId;
    assert(modelId !== undefined);

    const nodes = await fetchNodesForNodeIds(modelId, revisionId, nodeIds, cdfClient);
    nodeIds.forEach((e, ind) => {
      const modelNodeIdKey = `${modelId}-${revisionId}-${e}` as const;
      revisionNodeIdToNode.set(modelNodeIdKey, nodes[ind]);
    });
  });

  await Promise.all(nodePromises);

  return revisionNodeIdToNode;
}

function createRevisionToNodeIdMap(edges: FdmCadEdge[]): Map<RevisionId, NodeId[]> {
  return edges.reduce((revisionNodeIdMap, edge) => {
    const nodeIdsInRevision = revisionNodeIdMap.get(edge.properties.revisionId);

    if (nodeIdsInRevision !== undefined) {
      nodeIdsInRevision.push(edge.properties.revisionNodeId);
    } else {
      revisionNodeIdMap.set(edge.properties.revisionId, [edge.properties.revisionNodeId]);
    }

    return revisionNodeIdMap;
  }, new Map<RevisionId, NodeId[]>());
}
