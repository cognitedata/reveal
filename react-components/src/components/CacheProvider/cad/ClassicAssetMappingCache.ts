import { type CogniteClient, type Node3D, type CogniteInternalId } from '@cognite/sdk';
import {
  type ModelTreeIndexKey,
  type AssetId,
  type ModelId,
  type RevisionId,
  type ChunkInCacheTypes,
  type ModelAssetIdKey
} from '../types';
import { chunk, maxBy } from 'lodash';
import assert from 'assert';
import { modelRevisionNodesAssetToKey, createModelRevisionKey } from '../idAndKeyTranslation';
import { type ModelWithAssetMappings } from '../../../hooks/cad/ModelWithAssetMappings';
import { ClassicCadAssetMappingPerAssetIdCache } from './ClassicCadAssetMappingPerAssetIdCache';
import { ClassicCadAssetMappingPerNodeIdCache } from './ClassicCadAssetMappingPerNodeIdCache';
import { ClassicCadNode3DPerNodeIdCache } from './ClassicCadNode3DPerNodeIdCache';
import { ClassicCadAssetMappingPerModelCache } from './ClassicCadAssetMappingPerModelCache';
import { isValidClassicCadAssetMapping, type ClassicCadAssetMapping } from './ClassicAssetMapping';

export type ClassicCadNodeAssetMappingResult = {
  node?: Node3D;
  mappings: ClassicCadAssetMapping[];
};

export class ClassicCadAssetMappingCache {
  private readonly _sdk: CogniteClient;

  private readonly modelToAssetMappingsCache: ClassicCadAssetMappingPerModelCache;

  private readonly assetIdsToAssetMappingCache: ClassicCadAssetMappingPerAssetIdCache;

  private readonly nodeIdsToAssetMappingCache: ClassicCadAssetMappingPerNodeIdCache;

  private readonly nodeIdsToNode3DCache: ClassicCadNode3DPerNodeIdCache;

  private readonly _amountOfAssetIdsChunks = 1;

  constructor(sdk: CogniteClient) {
    this._sdk = sdk;
    this.assetIdsToAssetMappingCache = new ClassicCadAssetMappingPerAssetIdCache();
    this.nodeIdsToAssetMappingCache = new ClassicCadAssetMappingPerNodeIdCache();
    this.modelToAssetMappingsCache = new ClassicCadAssetMappingPerModelCache(this._sdk);
    this.nodeIdsToNode3DCache = new ClassicCadNode3DPerNodeIdCache(this._sdk);
  }

  public async getAssetMappingsForLowestAncestor(
    modelId: ModelId,
    revisionId: RevisionId,
    ancestors: Node3D[]
  ): Promise<ClassicCadNodeAssetMappingResult> {
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

    const assetIdsList = Array.from(relevantAssetIds);
    const chunkSize = Math.round(assetIdsList.length / this._amountOfAssetIdsChunks);
    const listChunks = chunk(assetIdsList, chunkSize);

    const allAssetMappingsReturned = listChunks.map(async (itemChunk) => {
      const assetMappings = await this.getAssetMappingsForAssetIds(modelId, revisionId, itemChunk);
      return assetMappings;
    });

    const allAssetMappings = await Promise.all(allAssetMappingsReturned);
    const assetMappings = allAssetMappings.flat();

    const relevantAssetMappings = assetMappings.filter((mapping) =>
      relevantAssetIds.has(mapping.assetId)
    );

    const nodes = await this.nodeIdsToNode3DCache.getNodesForNodeIds(
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

  public async generateNode3DCachePerItem(
    modelId: ModelId,
    revisionId: RevisionId,
    nodeIds: number[] | undefined
  ): Promise<void> {
    await this.nodeIdsToNode3DCache.generateNode3DCachePerItem(modelId, revisionId, nodeIds);
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
      modelMapping.assetMappings.forEach(async (item) => {
        const key = modelRevisionNodesAssetToKey(modelId, revisionId, item.assetId);
        await this.assetIdsToAssetMappingCache.setAssetMappingsCacheItem(key, item);
      });
    });
  }

  public async getAssetMappingsForModel(
    modelId: ModelId,
    revisionId: RevisionId
  ): Promise<ClassicCadAssetMapping[]> {
    const key = createModelRevisionKey(modelId, revisionId);
    const cachedResult = await this.modelToAssetMappingsCache.getModelToAssetMappingCacheItems(key);

    if (cachedResult !== undefined) {
      return cachedResult;
    }

    return await this.modelToAssetMappingsCache.fetchAndCacheMappingsForModel(modelId, revisionId);
  }

  private async splitChunkInCacheAssetMappings(
    currentChunk: number[],
    modelId: ModelId,
    revisionId: RevisionId,
    type: string
  ): Promise<ChunkInCacheTypes<ClassicCadAssetMapping>> {
    const chunkInCache: ClassicCadAssetMapping[] = [];
    const chunkNotCached: number[] = [];

    await Promise.all(
      currentChunk.map(async (id) => {
        const key = modelRevisionNodesAssetToKey(modelId, revisionId, id);
        const cachedResult = await this.getItemCacheResult(type, key);
        if (cachedResult !== undefined) {
          chunkInCache.push(...cachedResult);
        } else {
          chunkNotCached.push(id);
        }
      })
    );

    return { chunkInCache, chunkNotInCache: chunkNotCached };
  }

  private async getItemCacheResult(
    type: string,
    key: ModelTreeIndexKey | ModelAssetIdKey
  ): Promise<ClassicCadAssetMapping[] | undefined> {
    return type === 'nodeIds'
      ? await this.nodeIdsToAssetMappingCache.getNodeIdsToAssetMappingCacheItem(key)
      : await this.assetIdsToAssetMappingCache.getAssetIdsToAssetMappingCacheItem(key);
  }

  private setItemCacheResult(
    type: string,
    key: ModelTreeIndexKey | ModelAssetIdKey,
    item: ClassicCadAssetMapping[] | undefined
  ): void {
    const value = Promise.resolve(item ?? []);
    type === 'nodeIds'
      ? this.nodeIdsToAssetMappingCache.setNodeIdsToAssetMappingCacheItem(key, value)
      : this.assetIdsToAssetMappingCache.setAssetIdsToAssetMappingCacheItem(key, value);
  }

  private async fetchAssetMappingsRequest(
    currentChunk: number[],
    filterType: string,
    modelId: ModelId,
    revisionId: RevisionId
  ): Promise<ClassicCadAssetMapping[]> {
    if (currentChunk.length === 0) {
      return [];
    }
    const filter =
      filterType === 'nodeIds' ? { nodeIds: currentChunk } : { assetIds: currentChunk };

    const assetMapping3D = (
      await this._sdk.assetMappings3D
        .filter(modelId, revisionId, {
          limit: 1000,
          filter
        })
        .autoPagingToArray({ limit: Infinity })
    ).filter(isValidClassicCadAssetMapping);

    await Promise.all(
      assetMapping3D.map(async (item) => {
        const keyAssetId: ModelAssetIdKey = modelRevisionNodesAssetToKey(
          modelId,
          revisionId,
          item.assetId
        );
        const keyNodeId = modelRevisionNodesAssetToKey(modelId, revisionId, item.nodeId);
        await this.assetIdsToAssetMappingCache.setAssetMappingsCacheItem(keyAssetId, item);
        await this.nodeIdsToAssetMappingCache.setAssetMappingsCacheItem(keyNodeId, item);
      })
    );

    currentChunk.forEach(async (id) => {
      const key = modelRevisionNodesAssetToKey(modelId, revisionId, id);
      const cachedResult = await this.getItemCacheResult(filterType, key);

      if (cachedResult === undefined) {
        this.setItemCacheResult(filterType, key, []);
      }
    });

    return assetMapping3D;
  }

  private async fetchMappingsInQueue(
    index: number,
    idChunks: number[][],
    filterType: string,
    modelId: ModelId,
    revisionId: RevisionId,
    assetMappingsList: ClassicCadAssetMapping[]
  ): Promise<ClassicCadAssetMapping[]> {
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
  ): Promise<ClassicCadAssetMapping[]> {
    if (ids.length === 0) {
      return [];
    }
    const idChunks = chunk(ids, 1000);
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
  ): Promise<ClassicCadAssetMapping[]> {
    const nodeIds = nodes.map((node) => node.id);

    const { chunkNotInCache, chunkInCache } = await this.splitChunkInCacheAssetMappings(
      nodeIds,
      modelId,
      revisionId,
      'nodeIds'
    );

    const notCachedNodeIds: number[] = chunkNotInCache;

    const assetMappings = await this.fetchAndCacheMappingsForIds(
      modelId,
      revisionId,
      notCachedNodeIds,
      'nodeIds'
    );

    const allAssetMappings = chunkInCache.concat(assetMappings);
    return allAssetMappings;
  }

  private async getAssetMappingsForAssetIds(
    modelId: ModelId,
    revisionId: RevisionId,
    assetIds: number[]
  ): Promise<ClassicCadAssetMapping[]> {
    const { chunkNotInCache, chunkInCache } = await this.splitChunkInCacheAssetMappings(
      assetIds,
      modelId,
      revisionId,
      'assetIds'
    );

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
}
