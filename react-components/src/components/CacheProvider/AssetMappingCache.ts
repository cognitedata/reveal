/*!
 * Copyright 2023 Cognite AS
 */

import {
  type CogniteClient,
  type AssetMapping3D,
  type Node3D,
  type CogniteInternalId
} from '@cognite/sdk';
import {
  type ModelNodeIdKey,
  type AssetId,
  type ModelId,
  type ModelRevisionKey,
  type RevisionId,
  type ChunkInCacheTypes,
  type ChunkInCacheTypesNode3D
} from './types';
import { chunk, maxBy, uniqBy } from 'lodash';
import assert from 'assert';
import { fetchNodesForNodeIds } from './requests';
import { modelRevisionNodesAssetsToKey, modelRevisionToKey } from './utils';
import { type ModelWithAssetMappings } from './AssetMappingCacheProvider';

export type NodeAssetMappingResult = { node?: Node3D; mappings: AssetMapping[] };

export type AssetMapping = Required<AssetMapping3D>;
export class AssetMappingCache {
  private readonly _sdk: CogniteClient;

  private readonly _modelToAssetMappings = new Map<ModelRevisionKey, Promise<AssetMapping[]>>();
  public readonly _nodeAssetIdsToAssetMappings = new Map<ModelNodeIdKey, Promise<AssetMapping[]>>();

  private readonly _nodeAssetIdsToNode3D = new Map<ModelNodeIdKey, Promise<Node3D>>();

  constructor(sdk: CogniteClient) {
    this._sdk = sdk;
  }

  public async getAssetMappingsForLowestAncestor(
    modelId: ModelId,
    revisionId: RevisionId,
    ancestors: Node3D[]
  ): Promise<NodeAssetMappingResult> {
    if (ancestors.length === 0) {
      return { mappings: [] };
    }

    const searchTreeIndices = new Set(ancestors.map((ancestor) => ancestor.treeIndex));
    const allNodeMappings = await this.getAssetMappingsForNodes(modelId, revisionId, ancestors);

    const relevantMappings = allNodeMappings.filter((mapping) =>
      searchTreeIndices.has(mapping.treeIndex)
    );

    if (relevantMappings.length === 0) {
      return { mappings: [] };
    }

    const maxRelevantMappingTreeIndex = maxBy(
      relevantMappings,
      (mapping) => mapping.treeIndex
    )?.treeIndex;

    assert(maxRelevantMappingTreeIndex !== undefined);

    const mappingsOfNearestAncestor = relevantMappings.filter(
      (mapping) => mapping.treeIndex === maxRelevantMappingTreeIndex
    );

    const nearestMappedAncestor = ancestors.find(
      (node) => node.treeIndex === maxRelevantMappingTreeIndex
    );
    assert(nearestMappedAncestor !== undefined);

    return { node: nearestMappedAncestor, mappings: mappingsOfNearestAncestor };
  }

  public async getNodesForAssetIds(
    modelId: ModelId,
    revisionId: RevisionId,
    assetIds: CogniteInternalId[]
  ): Promise<Map<AssetId, Node3D[]>> {
    const relevantAssetIds = new Set(assetIds);

    const amountOfChunks = 1;
    const assetIdsList = Array.from(relevantAssetIds);
    const chunkSize = Math.round(assetIdsList.length / amountOfChunks);
    const listChunks = chunk(assetIdsList, chunkSize);

    console.log('chunk listChunks', listChunks.length, listChunks);

    const allAssetMappingsReturned = listChunks.map(async (itemChunk) => {
      const assetMappings = await this.getAssetMappingsForAssetIds(modelId, revisionId, itemChunk);
      return assetMappings;
    });

    const allAssetMappings = await Promise.all(allAssetMappingsReturned);
    const assetMappings = allAssetMappings.flat();

    const relevantAssetMappings = assetMappings.filter((mapping) =>
      relevantAssetIds.has(mapping.assetId)
    );

    const nodes = await this.getNodesForNodeIds(
      modelId,
      revisionId,
      relevantAssetMappings.map((assetMapping) => assetMapping.nodeId)
    );

    return nodes.reduce((acc, node, index) => {
      const key = relevantAssetMappings[index].assetId;
      const nodesForAsset = acc.get(key);

      if (nodesForAsset !== undefined) {
        nodesForAsset.push(node);
      } else {
        acc.set(key, [node]);
      }

      return acc;
    }, new Map<AssetId, Node3D[]>());
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

    console.log('chunk NODE IDS', chunkNotInCache, chunkInCache);

    const nodes = await fetchNodesForNodeIds(modelId, revisionId, chunkNotInCache, this._sdk);
    const allNodes = chunkInCache.concat(nodes);
    return allNodes;
  }

  public async generateNode3DCachePerItem(
    modelId: ModelId,
    revisionId: RevisionId,
    nodeIds: number[] | undefined
  ): Promise<void> {
    const node3Ds = await this.getNodesForNodeIds(modelId, revisionId, nodeIds ?? []);
    node3Ds.forEach((node) => {
      const key = modelRevisionNodesAssetsToKey(modelId, revisionId, [node.id]);
      this._nodeAssetIdsToNode3D.set(key, Promise.resolve(node));
    });
  }

  public async generateAssetMappingsCachePerItemFromModelCache(
    modelId: ModelId,
    revisionId: RevisionId,
    assetMappingsPerModel: ModelWithAssetMappings[] | undefined
  ): Promise<void> {
    if (assetMappingsPerModel === undefined) {
      return;
    }
    assetMappingsPerModel.forEach(async (modelMapping) => {
      console.log(' assetMappings modelMapping ', modelMapping);

      modelMapping.assetMappings.forEach(async (item) => {
        const key = modelRevisionNodesAssetsToKey(modelId, revisionId, [item.assetId]);
        await this.setAssetMappingsCacheItem(key, item);
      });
    });
    console.log(' assetMappings cache', this._nodeAssetIdsToAssetMappings);
  }

  public async getAssetMappingsForModel(
    modelId: ModelId,
    revisionId: RevisionId
  ): Promise<AssetMapping[]> {
    const key = modelRevisionToKey(modelId, revisionId);
    const cachedResult = this._modelToAssetMappings.get(key);

    if (cachedResult !== undefined) {
      return await cachedResult;
    }

    return await this.fetchAndCacheMappingsForModel(modelId, revisionId);
  }

  private async splitChunkInCacheAssetMappings(
    currentChunk: number[],
    modelId: ModelId,
    revisionId: RevisionId
  ): Promise<ChunkInCacheTypes> {
    const chunkInCache: Array<Required<AssetMapping3D>> = [];
    const chunkNotCached: number[] = [];

    await Promise.all(
      currentChunk.map(async (id) => {
        const key = modelRevisionNodesAssetsToKey(modelId, revisionId, [id]);
        const cachedResult = await this.getNodeAssetIdsToAssetMappingCacheItem(key);
        if (cachedResult !== undefined) {
          chunkInCache.push(...cachedResult);
        } else {
          chunkNotCached.push(id);
        }
      })
    );

    return { chunkInCache, chunkNotInCache: chunkNotCached };
  }

  private async splitChunkInCacheNode3D(
    currentChunk: number[],
    modelId: ModelId,
    revisionId: RevisionId
  ): Promise<ChunkInCacheTypesNode3D> {
    const chunkInCache: Node3D[] = [];
    const chunkNotCached: number[] = [];

    await Promise.all(
      currentChunk.map(async (id) => {
        const key = modelRevisionNodesAssetsToKey(modelId, revisionId, [id]);
        const cachedResult = await this._nodeAssetIdsToNode3D.get(key);
        if (cachedResult !== undefined) {
          chunkInCache.push(cachedResult);
        } else {
          chunkNotCached.push(id);
        }
      })
    );

    return { chunkInCache, chunkNotInCache: chunkNotCached };
  }

  private async fetchAssetMappingsRequest(
    currentChunk: number[],
    filterType: string,
    modelId: ModelId,
    revisionId: RevisionId
  ): Promise<AssetMapping[]> {
    let assetMapping3D: AssetMapping3D[] = [];

    if (currentChunk.length === 0) {
      return [];
    }
    const filter =
      filterType === 'nodeIds' ? { nodeIds: currentChunk } : { assetIds: currentChunk };

    assetMapping3D = await this._sdk.assetMappings3D
      .filter(modelId, revisionId, {
        limit: 1000,
        filter
      })
      .autoPagingToArray({ limit: Infinity });

    assetMapping3D.forEach(async (item) => {
      const key: ModelNodeIdKey = modelRevisionNodesAssetsToKey(modelId, revisionId, [
        item.assetId
      ]);
      await this.setAssetMappingsCacheItem(key, item);
    });

    currentChunk.forEach(async (id) => {
      const key = modelRevisionNodesAssetsToKey(modelId, revisionId, [id]);
      const cachedResult = await this.getNodeAssetIdsToAssetMappingCacheItem(key);
      if (cachedResult === undefined) {
        this.setNodeAssetIdsToAssetMappingCacheItem(key, Promise.resolve([]));
      }
      console.log('chunk fetchAssetMappingsRequest  key, cachedResult ', key, cachedResult);
    });

    return assetMapping3D.filter(isValidAssetMapping);
  }

  private async setAssetMappingsCacheItem(key: ModelNodeIdKey, item: AssetMapping): Promise<void> {
    const currentAssetMappings = this.getNodeAssetIdsToAssetMappingCacheItem(key);
    this.setNodeAssetIdsToAssetMappingCacheItem(
      key,
      currentAssetMappings.then((value) => {
        if (value === undefined) {
          return [item];
        }
        const newNotDuplicatedMappings = uniqBy(value, 'nodeId');
        newNotDuplicatedMappings.push(item);
        return newNotDuplicatedMappings;
      })
    );
  }

  public setNodeAssetIdsToAssetMappingCacheItem(
    key: ModelNodeIdKey,
    item: Promise<Array<Required<AssetMapping3D>>>
  ): void {
    this._nodeAssetIdsToAssetMappings.set(key, Promise.resolve(item));
  }

  public async getNodeAssetIdsToAssetMappingCacheItem(
    key: ModelNodeIdKey
  ): Promise<AssetMapping[] | undefined> {
    return await this._nodeAssetIdsToAssetMappings.get(key);
  }

  private async fetchMappingsInQueue(
    index: number,
    idChunks: number[][],
    filterType: string,
    modelId: ModelId,
    revisionId: RevisionId,
    assetMappingsList: Array<Required<AssetMapping3D>>
  ): Promise<AssetMapping3D[]> {
    const assetMappings = await this.fetchAssetMappingsRequest(
      idChunks[index],
      filterType,
      modelId,
      revisionId
    );

    assetMappingsList = assetMappingsList.concat(assetMappings);
    if (index >= idChunks.length - 1) {
      return assetMappingsList;
    }

    const nextIndex = index + 1;
    return await this.fetchMappingsInQueue(
      nextIndex,
      idChunks,
      filterType,
      modelId,
      revisionId,
      assetMappingsList
    );
  }

  private async fetchAndCacheMappingsForIds(
    modelId: ModelId,
    revisionId: RevisionId,
    ids: number[],
    filterType: string
  ): Promise<AssetMapping[]> {
    if (ids.length === 0) {
      return [];
    }
    const idChunks = chunk(ids, 100);
    const initialIndex = 0;
    const assetMappings = await this.fetchMappingsInQueue(
      initialIndex,
      idChunks,
      filterType,
      modelId,
      revisionId,
      []
    );
    return assetMappings;
  }

  private async getAssetMappingsForNodes(
    modelId: ModelId,
    revisionId: RevisionId,
    nodes: Node3D[]
  ): Promise<AssetMapping[]> {
    const nodeIds = nodes.map((node) => node.id);

    const { chunkNotInCache, chunkInCache } = await this.splitChunkInCacheAssetMappings(
      nodeIds,
      modelId,
      revisionId
    );

    const notCachedNodeIds: number[] = chunkNotInCache;

    const assetMappings = await this.fetchAndCacheMappingsForIds(
      modelId,
      revisionId,
      notCachedNodeIds,
      'nodeIds'
    );
    console.log(
      'chunk getAssetMappingsForNodes  chunkNotInCache, chunkInCache ',
      chunkNotInCache,
      chunkInCache
    );

    const allAssetMappings = chunkInCache.concat(assetMappings);
    return allAssetMappings;
  }

  private async getAssetMappingsForAssetIds(
    modelId: ModelId,
    revisionId: RevisionId,
    assetIds: number[]
  ): Promise<AssetMapping[]> {
    const { chunkNotInCache, chunkInCache } = await this.splitChunkInCacheAssetMappings(
      assetIds,
      modelId,
      revisionId
    );

    console.log('chunk assetIds modelId', modelId, assetIds);
    console.log('chunk chunkInCache modelId ', modelId, chunkInCache);
    console.log('chunk chunkNotInCache modelId ', modelId, chunkNotInCache);

    const notCachedAssetIds: number[] = chunkNotInCache;

    const assetMappings = await this.fetchAndCacheMappingsForIds(
      modelId,
      revisionId,
      notCachedAssetIds,
      'assetIds'
    );
    const allAssetMappings = chunkInCache.concat(assetMappings);
    return allAssetMappings;
  }

  private async fetchAndCacheMappingsForModel(
    modelId: ModelId,
    revisionId: RevisionId
  ): Promise<AssetMapping[]> {
    const key = modelRevisionToKey(modelId, revisionId);
    const assetMappings = this.fetchAssetMappingsForModel(modelId, revisionId);

    this._modelToAssetMappings.set(key, assetMappings);
    return await assetMappings;
  }

  private async fetchAssetMappingsForModel(
    modelId: ModelId,
    revisionId: RevisionId
  ): Promise<AssetMapping[]> {
    const assetMapping3D = await this._sdk.assetMappings3D
      .list(modelId, revisionId, { limit: 1000 })
      .autoPagingToArray({ limit: Infinity });

    return assetMapping3D.filter(isValidAssetMapping);
  }
}

function isValidAssetMapping(assetMapping: AssetMapping3D): assetMapping is AssetMapping {
  return assetMapping.treeIndex !== undefined && assetMapping.subtreeSize !== undefined;
}
