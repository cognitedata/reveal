/*!
 * Copyright 2023 Cognite AS
 */

import { type CogniteClient } from '@cognite/sdk/dist/src';
import { EdgeItem, type DmsUniqueIdentifier, type FdmSDK } from '../../utilities/FdmSDK';
import { RevisionNodeCache, nodeIdsToTreeIndexes } from './RevisionNodeCache';
import { type CogniteCadModel } from '@cognite/reveal';
import { InModel3dEdgeProperties, SYSTEM_3D_EDGE_SOURCE, SYSTEM_SPACE_3D_SCHEMA } from '../../utilities/globalDataModels';
import { ModelRevisionId, ModelRevisionToEdgeMap } from '../../hooks/useMappedEquipmentBy3DModelsList';

import assert from 'assert';

export type RevisionKey = `${number}-${number}`;
export type FdmKey = `${string}-${string}`;

export type ModelId = number;
export type RevisionId = number;
export type TreeIndex = number;
export type RevisionTreeIndex = `${ModelId}-${RevisionId}-${TreeIndex}`;
export type FdmId = DmsUniqueIdentifier;

export class FdmNodeCache {
  private readonly _revisionNodeCaches = new Map<RevisionKey, RevisionNodeCache>();

  private readonly _cdfClient: CogniteClient;
  private readonly _fdmClient: FdmSDK;

  private readonly _globalCdfToFdmMap = new Map<
    RevisionTreeIndex,
    { values: FdmKey[]; complete: boolean }
  >();

  public constructor(cdfClient: CogniteClient, fdmClient: FdmSDK) {
    this._cdfClient = cdfClient;
    this._fdmClient = fdmClient;
  }

  public async getAllMappingExternalIds(
    modelRevisionIds: Array<{ modelId: number; revisionId: number }>
  ): Promise<ModelRevisionToEdgeMap> {

    const revisionIds = modelRevisionIds.map((modelRevisionId) => modelRevisionId.revisionId);
    const edges = await getEdgesForRevisions(revisionIds, this._fdmClient);
    const groupToModels = await groupToModelRevision(edges, modelRevisionIds, this._cdfClient);

    for (const [revisionKey, data] of groupToModels.entries()) {
      const [modelId, revisionId] = revisionKeyToIds(revisionKey);

      data.forEach(edge => {
        const treeIndexKey = createRevisionTreeIndex(modelId, revisionId, edge.treeIndex);

        insertIntoSetMap(treeIndexKey, createFdmKey(edge.startNode.space, edge.startNode.externalId), this._globalCdfToFdmMap);
      });
    }

    return groupToModels;
  }

  public async getClosestParentExternalId(
    modelId: number,
    revisionId: number,
    treeIndex: number
  ): Promise<FdmId[]> {
    const revisionCache = this.getOrCreateRevisionCache(modelId, revisionId);

    return await revisionCache.getClosestParentExternalIds(treeIndex);
  }

  private getOrCreateRevisionCache(modelId: number, revisionId: number): RevisionNodeCache {
    const revisionKey = getRevisionKey(modelId, revisionId);
    if (!this._revisionNodeCaches.has(revisionKey)) {
      this._revisionNodeCaches.set(
        revisionKey,
        new RevisionNodeCache(
          this._cdfClient,
          this._fdmClient,
          modelId,
          revisionId,
          this._globalCdfToFdmMap
        )
      );
    }

    return this._revisionNodeCaches.get(revisionKey)!;
  }
}

async function getNodeIdsForAsset(
  space: string,
  externalId: string
): Promise<Array<{ modelId: number; revisionId: number; nodeId: number }>> {
  return [];
}

function getRevisionKey(modelId: number, revisionId: number): RevisionKey {
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

function treeIndexKeyToId(key: RevisionTreeIndex): {
  modelId: number;
  revisionId: number;
  treeIndex: number;
} {
  const parts = key.split('-');

  return { modelId: Number(parts[0]), revisionId: Number(parts[1]), treeIndex: Number(parts[2]) };
}

export function fdmKeyToId(fdmKey: FdmKey): FdmId {
  const parts = fdmKey.split('-');

  return { space: parts[0], externalId: parts[1] };
}

export function insertIntoSetMap<T, U>(
  key: T,
  value: U,
  globalMap: Map<T, { complete: boolean; values: U[] }>
): void {
  const prevVal = globalMap.get(key);

  if (prevVal === undefined) {
    globalMap.set(key, { complete: false, values: [value] });
    return;
  }

  prevVal.values.push(value);
}

async function groupToModelRevision(
  edges: Array<EdgeItem<InModel3dEdgeProperties>>,
  modelRevisionIds: Array<{ modelId: number; revisionId: number }>,
  cdfClient: CogniteClient
): Promise<Map<RevisionKey, Array<EdgeItem<InModel3dEdgeProperties> & { treeIndex: TreeIndex }>>> {
  const nodeIdsPerRevision = edges.reduce(
    (revisionNodeIdMap, edge) => {
      const nodeIdsInRevision = revisionNodeIdMap.get(edge.properties.revisionId);
      if (nodeIdsInRevision !== undefined) {
        nodeIdsInRevision.push(edge.properties.revisionNodeId);
      } else {
        revisionNodeIdMap.set(edge.properties.revisionId, [edge.properties.revisionNodeId]);
      }

      return revisionNodeIdMap;
    },
    new Map<RevisionId, number[]>());

  type RevisionNodeId = `${RevisionId}-${number}`;
  const revisionNodeIdToTreeIndexList = new Map<RevisionNodeId, TreeIndex>();

  const treeIndexesPromises = [...nodeIdsPerRevision.entries()].map(async ([revisionId, nodeIds]) => {
    const modelId = modelRevisionIds.find(p => p.revisionId === revisionId)?.modelId;
    assert(modelId !== undefined);

    const treeIndexes = await nodeIdsToTreeIndexes(modelId, revisionId, nodeIds, cdfClient);
    nodeIds.forEach((e, ind) => {
      const revisionNodeIdKey = `${revisionId}-${e}` as const;
      revisionNodeIdToTreeIndexList.set(revisionNodeIdKey, treeIndexes[ind]);
    });
  });

  await Promise.all(treeIndexesPromises);

  return edges.reduce((map, edge) => {
    const edgeRevisionId = edge.properties.revisionId;
    const modelRevisionId = modelRevisionIds.find((p) => p.revisionId === edgeRevisionId);
    if (modelRevisionId === undefined) return map;
    const modelRevisionIdKey: ModelRevisionId = getRevisionKey(modelRevisionId.modelId, modelRevisionId.revisionId);
    const edgesForModel = map.get(modelRevisionIdKey);
    const revisionNodeIdKey = `${modelRevisionId.revisionId}-${edge.properties.revisionNodeId}` as const;
    const value = { ...edge, treeIndex: revisionNodeIdToTreeIndexList.get(revisionNodeIdKey)! };
    if (edgesForModel === undefined) {
      map.set(modelRevisionIdKey, [value]);
    } else {
      edgesForModel.push(value);
    }

    return map;
  }, new Map<ModelRevisionId, Array<EdgeItem<InModel3dEdgeProperties> & { treeIndex: TreeIndex }>>());
}

async function getEdgesForRevisions(
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
