/*!
 * Copyright 2021 Cognite AS
 */

import { CogniteInternalId } from '@cognite/sdk';

import { NodesApiClient } from '@reveal/nodes-api';
import { batchedDebounce, type BatchedDebounce } from '@reveal/utilities';

type NodeIdRequest = CogniteInternalId;
type TreeIndexRequest = number;

/* eslint-disable jsdoc/require-jsdoc */
/**
 * @internal
 */
export class NodeIdAndTreeIndexMaps {
  private readonly modelId: number;
  private readonly revisionId: number;
  private readonly nodesApiClient: NodesApiClient;

  private readonly treeIndexSubTreeSizeMap: Map<number, number>;

  private readonly nodeIdToTreeIndexMap: Map<number, number>;
  private readonly treeIndexToNodeIdMap: Map<number, number>;

  private readonly _debouncedGetNodeIdByTreeIndex: BatchedDebounce<number, number>;
  private readonly _debouncedGetTreeIndexByNodeId: BatchedDebounce<number, number>;
  private readonly _debouncedGetSubtreeSize: BatchedDebounce<number, { treeIndex: number; subtreeSize: number }>;

  constructor(modelId: number, revisionId: number, nodesApiClient: NodesApiClient) {
    this.modelId = modelId;
    this.revisionId = revisionId;
    this.nodesApiClient = nodesApiClient;

    this.nodeIdToTreeIndexMap = new Map();
    this.treeIndexToNodeIdMap = new Map();
    this.treeIndexSubTreeSizeMap = new Map();

    this._debouncedGetTreeIndexByNodeId = batchedDebounce(async (requests: NodeIdRequest[]) => {
      const treeIndices = await this.nodesApiClient.mapNodeIdsToTreeIndices(this.modelId, this.revisionId, requests);

      requests.forEach((nodeId, index) => {
        const treeIndex = treeIndices[index];
        this.nodeIdToTreeIndexMap.set(nodeId, treeIndex);
        this.treeIndexToNodeIdMap.set(treeIndex, nodeId);
      });

      return treeIndices;
    }, 50);

    this._debouncedGetNodeIdByTreeIndex = batchedDebounce(async (requests: TreeIndexRequest[]) => {
      const nodeIds = await this.nodesApiClient.mapTreeIndicesToNodeIds(this.modelId, this.revisionId, requests);

      requests.forEach((treeIndex, index) => {
        const nodeId = nodeIds[index];
        this.nodeIdToTreeIndexMap.set(nodeId, treeIndex);
        this.treeIndexToNodeIdMap.set(treeIndex, nodeId);
      });

      return nodeIds;
    }, 50);

    this._debouncedGetSubtreeSize = batchedDebounce(async (requests: CogniteInternalId[]) => {
      const subtreeSizes = await this.nodesApiClient.determineTreeIndexAndSubtreeSizesByNodeIds(
        this.modelId,
        this.revisionId,
        requests
      );

      subtreeSizes.forEach(node => {
        this.treeIndexSubTreeSizeMap.set(node.treeIndex, node.subtreeSize);
      });

      return subtreeSizes;
    }, 50);
  }

  async getTreeIndex(nodeId: CogniteInternalId): Promise<number> {
    const treeIndex = this.nodeIdToTreeIndexMap.get(nodeId);
    if (treeIndex !== undefined) {
      return treeIndex;
    }

    return this._debouncedGetTreeIndexByNodeId(nodeId);
  }

  async getNodeId(treeIndex: number): Promise<number> {
    const nodeId = this.treeIndexToNodeIdMap.get(treeIndex);
    if (nodeId !== undefined) {
      return nodeId;
    }

    return this._debouncedGetNodeIdByTreeIndex(treeIndex);
  }

  async getSubtreeSize(treeIndex: number): Promise<number> {
    const subtreeSize = this.treeIndexSubTreeSizeMap.get(treeIndex);
    if (subtreeSize) {
      return subtreeSize;
    }

    const nodeId = await this._debouncedGetNodeIdByTreeIndex(treeIndex);

    return (await this._debouncedGetSubtreeSize(nodeId)).subtreeSize;
  }

  async getTreeIndices(nodeIds: number[]): Promise<number[]> {
    const mapped = nodeIds.map(id => this.nodeIdToTreeIndexMap.get(id) || -1);
    const notCachedNodeIds = nodeIds.filter((_value, index) => mapped[index] === -1);
    if (notCachedNodeIds.length === 0) {
      return mapped;
    }
    const nodeIdToIndex = new Map(nodeIds.map((value, index) => [value, index]));

    const treeIndices = await this.nodesApiClient.mapNodeIdsToTreeIndices(
      this.modelId,
      this.revisionId,
      notCachedNodeIds
    );
    console.assert(notCachedNodeIds.length === treeIndices.length);
    for (let i = 0; i < treeIndices.length; i++) {
      const nodeId = notCachedNodeIds[i];
      const treeIndex = treeIndices[i];
      const index = nodeIdToIndex.get(nodeId)!;
      mapped[index] = treeIndex;
      this.add(nodeId, treeIndex);
    }

    return mapped;
  }

  async getNodeIds(treeIndices: number[]): Promise<number[]> {
    const mapped = treeIndices.map(idX => this.treeIndexToNodeIdMap.get(idX) || -1);
    const notCachedTreeIndices = treeIndices.filter((_value, index) => mapped[index] === -1);
    if (notCachedTreeIndices.length === 0) {
      return mapped;
    }
    const treeIndexToIndex = new Map(treeIndices.map((value, index) => [value, index]));

    const nodeIds = await this.nodesApiClient.mapTreeIndicesToNodeIds(
      this.modelId,
      this.revisionId,
      notCachedTreeIndices
    );
    console.assert(nodeIds.length === notCachedTreeIndices.length);
    for (let i = 0; i < nodeIds.length; i++) {
      const nodeId = nodeIds[i];
      const treeIndex = notCachedTreeIndices[i];
      const index = treeIndexToIndex.get(treeIndex)!;
      mapped[index] = nodeId;
      this.add(nodeId, treeIndex);
    }

    return mapped;
  }

  add(nodeId: number, treeIndex: number): void {
    this.nodeIdToTreeIndexMap.set(nodeId, treeIndex);
    this.treeIndexToNodeIdMap.set(treeIndex, nodeId);
  }
}
