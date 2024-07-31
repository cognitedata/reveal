/*!
 * Copyright 2024 Cognite AS
 */
import { type Node3D, type CogniteClient } from '@cognite/sdk';
import {
  type ChunkInCacheTypes,
  type ModelId,
  type RevisionId,
  type ModelNodeIdKey
} from './types';
import { modelRevisionNodesAssetsToKey } from './utils';
import { fetchNodesForNodeIds } from './requests';

export class Node3DPerNodeIdCache {
  private readonly _sdk: CogniteClient;

  private readonly _nodeIdsToNode3D = new Map<ModelNodeIdKey, Promise<Node3D>>();

  constructor(sdk: CogniteClient) {
    this._sdk = sdk;
  }

  private async splitChunkInCacheNode3D(
    currentChunk: number[],
    modelId: ModelId,
    revisionId: RevisionId
  ): Promise<ChunkInCacheTypes<Node3D>> {
    const chunkInCache: Node3D[] = [];
    const chunkNotCached: number[] = [];

    await Promise.all(
      currentChunk.map(async (id) => {
        const key = modelRevisionNodesAssetsToKey(modelId, revisionId, [id]);
        const cachedResult = await this.getNodeIdToNode3DCacheItem(key);
        if (cachedResult !== undefined) {
          chunkInCache.push(cachedResult);
        } else {
          chunkNotCached.push(id);
        }
      })
    );

    return { chunkInCache, chunkNotInCache: chunkNotCached };
  }

  public async generateNode3DCachePerItem(
    modelId: ModelId,
    revisionId: RevisionId,
    nodeIds: number[] | undefined
  ): Promise<void> {
    const node3Ds = await this.getNodesForNodeIds(modelId, revisionId, nodeIds ?? []);
    node3Ds.forEach((node) => {
      const key = modelRevisionNodesAssetsToKey(modelId, revisionId, [node.id]);
      this.setNodeIdToNode3DCacheItem(key, Promise.resolve(node));
    });
  }

  public async getNodesForNodeIds(
    modelId: ModelId,
    revisionId: RevisionId,
    nodeIds: number[]
  ): Promise<Node3D[]> {
    const { chunkNotInCache, chunkInCache } = await this.splitChunkInCacheNode3D(
      nodeIds,
      modelId,
      revisionId
    );

    const nodes = await fetchNodesForNodeIds(modelId, revisionId, chunkNotInCache, this._sdk);
    const allNodes = chunkInCache.concat(nodes);
    return allNodes;
  }

  public async getNodeIdToNode3DCacheItem(key: ModelNodeIdKey): Promise<Node3D | undefined> {
    return await this._nodeIdsToNode3D.get(key);
  }

  public setNodeIdToNode3DCacheItem(key: ModelNodeIdKey, item: Promise<Node3D>): void {
    this._nodeIdsToNode3D.set(key, Promise.resolve(item));
  }
}
