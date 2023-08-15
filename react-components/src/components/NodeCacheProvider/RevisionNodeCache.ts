/*!
 * Copyright 2023 Cognite AS
 */

import { type CogniteClient, type Node3D } from '@cognite/sdk';
import { type EdgeItem, type FdmSDK } from '../../utilities/FdmSDK';
import {
  type FdmId,
  type FdmKey,
  type RevisionTreeIndex,
  createFdmKey,
  createRevisionTreeIndex,
  fdmKeyToId,
  insertIntoSetMap
} from './NodeCache';

import { maxBy } from 'lodash';
import { type CogniteCadModel } from '@cognite/reveal';

export type CursorType = any;

type MappingsResponse = {
  results: Array<FdmId & { treeIndex: number }>;
  nextCursor: any | undefined;
};

export class RevisionNodeCache {
  private readonly _cogniteClient: CogniteClient;
  private readonly _fdmClient: FdmSDK;

  private readonly _modelId: number;
  private readonly _revisionId: number;

  private readonly _globalCdfToFdmMap: Map<
    RevisionTreeIndex,
    { values: FdmKey[]; complete: boolean }
  >;

  private readonly _cursorToIdsCache = new Map<
    CursorType | undefined,
    { results: FdmId[]; nextCursor: CursorType | undefined }
  >();

  private readonly _mappedTreeIndexKeys = new Set<RevisionTreeIndex>();
  private readonly _mappedFdmKeys = new Set<FdmKey>();

  constructor(
    cogniteClient: CogniteClient,
    fdmClient: FdmSDK,
    modelId: number,
    revisionId: number,
    globalCdfToFdmMap: Map<RevisionTreeIndex, { values: FdmKey[]; complete: boolean }>
  ) {
    this._cogniteClient = cogniteClient;
    this._fdmClient = fdmClient;

    this._globalCdfToFdmMap = globalCdfToFdmMap;

    this._modelId = modelId;
    this._revisionId = revisionId;
  }

  public hasMappingData(): boolean {
    re
  }

  public async getAllMappingExternalIds(
    cursor: any | undefined
  ): Promise<{ results: FdmId[]; nextCursor: CursorType | undefined }> {
    if (this._cursorToIdsCache.has(cursor)) {
      return this._cursorToIdsCache.get(cursor)!;
    }

    const response: MappingsResponse = await fetchAllMappingExternalIdsWithTreeIndex(
      this._modelId,
      this._revisionId,
      cursor
    );

    this.accumulateDataInCache(response, cursor);

    if (this.isLastData(response)) {
      this.markMappedDataAsComplete();
    }

    return response;
  }

  private accumulateDataInCache(data: MappingsResponse, cursor: CursorType | undefined): void {
    data.results.forEach((e) => {
      const treeIndexKey = createRevisionTreeIndex(
        this._modelId,
        this._revisionId,
        e.treeIndex
      );
      const fdmKey = createFdmKey(e.space, e.externalId);

      insertIntoSetMap(treeIndexKey, fdmKey, this._globalCdfToFdmMap);
      insertIntoSetMap(fdmKey, treeIndexKey, this._globalFdmToCdfMap);

      this._mappedTreeIndexKeys.add(treeIndexKey);
      this._mappedFdmKeys.add(fdmKey);
    });

    this._cursorToIdsCache.set(cursor, data);
  }

  private isLastData(data: MappingsResponse): boolean {
    return data.nextCursor === undefined;
  }

  private markMappedDataAsComplete(): void {
    this._mappedFdmKeys.forEach((key) => {
      this._globalFdmToCdfMap.get(key)!.complete = true;
    });

    this._mappedTreeIndexKeys.forEach((key) => {
      this._globalCdfToFdmMap.get(key)!.complete = true;
    });
  }

  public async getClosestParentExternalIds(treeIndex: number): Promise<FdmId[]> {
    const firstTreeIndexKey: RevisionTreeIndex = createRevisionTreeIndex(this._modelId, this._revisionId, treeIndex);

    if (this._globalCdfToFdmMap.get(firstTreeIndexKey)?.complete) {
      const values = this._globalCdfToFdmMap.get(firstTreeIndexKey)!.values;
      return values.map((key) => fdmKeyToId(key));
    }

    const { fdmIds, lowestAncestors, firstMappedTreeIndex } =
      await this.queryClosestParentExternalIds(treeIndex);

    const fdmKeys = fdmIds.map((id) => createFdmKey(id.space, id.externalId));
    const firstMappedTreeIndexKey = createRevisionTreeIndex(this._modelId, this._revisionId, firstMappedTreeIndex);

    lowestAncestors.forEach((node) => {
      const treeIndexKey = createRevisionTreeIndex(this._modelId, this._revisionId, node.treeIndex);
      this._globalCdfToFdmMap.set(treeIndexKey, { complete: true, values: fdmKeys });
    });

    fdmKeys.forEach((fdmKey) => {
      insertIntoSetMap(fdmKey, firstMappedTreeIndexKey, this._globalFdmToCdfMap);
      this._globalFdmToCdfMap.get(fdmKey)!.complete = true;
    });

    return fdmIds;
  }

  private async queryClosestParentExternalIds(
    treeIndex: number
  ): Promise<{ fdmIds: FdmId[]; lowestAncestors: Node3D[]; firstMappedTreeIndex: number }> {
    const ancestors: Node3D[] = await fetchAncestorNodesForTreeIndex(
      this._modelId,
      this._revisionId,
      treeIndex,
      this._cogniteClient
    );

    const ancestorMappings: { edges: Array<EdgeItem<Record<string, any>>> } =
      await getEdgesForNodes(
        this._revisionId,
        ancestors.map((a) => a.id)
      );

    if (ancestorMappings.edges.length === 0) {
      return { fdmIds: [], lowestAncestors: [], firstMappedTreeIndex: 0 };
    }

    const mappings = ancestorMappings.edges.map((e) => ({
      externalId: e.startNode.externalId,
      space: e.startNode.space,
      treeIndex: ancestors.find((a) => a.id === e.properties.nodeId)!.treeIndex
    }));

    const firstMappedTreeIndex = maxBy(mappings, (mapping) => mapping.treeIndex)!.treeIndex;
    const resultsInLowerTree = mappings.filter((a) => a.treeIndex === firstMappedTreeIndex);

    return {
      fdmIds: resultsInLowerTree,
      lowestAncestors: ancestors.filter((a) => a.treeIndex >= firstMappedTreeIndex),
      firstMappedTreeIndex
    };
  }

  getIds(): { modelId: number; revisionId: number } {
    return {
      modelId: this._modelId,
      revisionId: this._revisionId
    };
  }
}

async function fetchAncestorNodesForTreeIndex(
  modelId: number,
  revisionId: number,
  treeIndex: number,
  cogniteClient: CogniteClient
): Promise<Node3D[]> {
  const nodeId = await treeIndexToNodeId(modelId, revisionId, treeIndex, cogniteClient);

  const ancestorNodes = await cogniteClient.revisions3D.list3DNodeAncestors(
    modelId,
    revisionId,
    nodeId
  );

  return ancestorNodes.items;
}

async function fetchAllMappingExternalIdsWithTreeIndex(
  modelId: number,
  revisionId: number,
  cursor: CursorType
): Promise<MappingsResponse> {

}

export async function treeIndexesToNodeIds(modelId: number, revisionId: number, treeIndexes: number[], cogniteClient: CogniteClient): Promise<number[]> {
    const outputsUrl = `${cogniteClient.getBaseUrl()}/api/v1/projects/${
      cogniteClient.project
    }/3d/models/${modelId}/revisions/${revisionId}/nodes/internalids/bytreeindices`;
  const response = await cogniteClient.post<{ items: number[] }>(outputsUrl, { data: { items: treeIndexes } });
    if (response.status === 200) {
      return response.data.items;
    } else {
      throw Error(`treeIndex-nodeId translation failed for treeIndexes ${treeIndexes}`);
    }
}

export async function nodeIdsToTreeIndexes(modelId: number, revisionId: number, nodeIds: number[], cogniteClient: CogniteClient): Promise<number[]> {
    const outputsUrl = `${cogniteClient.getBaseUrl()}/api/v1/projects/${
      cogniteClient.project
    }/3d/models/${modelId}/revisions/${revisionId}/nodes/treeindices/byinternalids`;
  const response = await cogniteClient.post<{ items: number[] }>(outputsUrl, { data: { items: nodeIds } });
    if (response.status === 200) {
      return response.data.items;
    } else {
      throw Error(`nodeId-treeIndex translation failed for nodeIds ${nodeIds}`);
    }
}
