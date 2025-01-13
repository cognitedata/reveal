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
  type ModelTreeIndexKey,
  type AssetId,
  type ModelId,
  type RevisionId,
  type ChunkInCacheTypes,
  type ModelAssetIdKey
} from './types';
import { chunk, maxBy } from 'lodash';
import assert from 'assert';
import { isValidAssetMapping } from './utils';
import { modelRevisionNodesAssetToKey, createModelRevisionKey } from './idAndKeyTranslation';
import { type ModelWithAssetMappings } from '../../hooks/cad/ModelWithAssetMappings';
import { AssetMappingPerAssetIdCache } from './AssetMappingPerAssetIdCache';
import { AssetMappingPerNodeIdCache } from './AssetMappingPerNodeIdCache';
import { Node3DPerNodeIdCache } from './Node3DPerNodeIdCache';
import { AssetMappingPerModelCache } from './AssetMappingPerModelCache';
import { isDefined } from '../../utilities/isDefined';

export type NodeAssetMappingResult = { node?: Node3D; mappings: AssetMapping[] };

export type AssetMapping = AssetMapping3D;

export class AssetMappingAndNode3DCache {
  private readonly _sdk: CogniteClient;

  private readonly modelToAssetMappingsCache: AssetMappingPerModelCache;

  private readonly assetIdsToAssetMappingCache: AssetMappingPerAssetIdCache;

  private readonly nodeIdsToAssetMappingCache: AssetMappingPerNodeIdCache;

  private readonly nodeIdsToNode3DCache: Node3DPerNodeIdCache;

  private readonly _amountOfAssetIdsChunks = 1;

  private readonly isCoreDmOnly = false;

  constructor(sdk: CogniteClient, coreDmOnly: boolean) {
    this._sdk = sdk;
    this.assetIdsToAssetMappingCache = new AssetMappingPerAssetIdCache();
    this.nodeIdsToAssetMappingCache = new AssetMappingPerNodeIdCache();
    this.modelToAssetMappingsCache = new AssetMappingPerModelCache(this._sdk, coreDmOnly);
    this.nodeIdsToNode3DCache = new Node3DPerNodeIdCache(this._sdk, coreDmOnly);
    this.isCoreDmOnly = coreDmOnly;
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

    const assetIdsList = Array.from(relevantAssetIds);
    const chunkSize = Math.round(assetIdsList.length / this._amountOfAssetIdsChunks);
    const listChunks = chunk(assetIdsList, chunkSize);

    const allAssetMappingsReturned = listChunks.map(async (itemChunk) => {
      const assetMappings = await this.getAssetMappingsForAssetIds(modelId, revisionId, itemChunk);
      return assetMappings;
    });

    const allAssetMappings = await Promise.all(allAssetMappingsReturned);
    const assetMappings = allAssetMappings.flat();

    const relevantAssetMappings = assetMappings.filter(
      (mapping) => mapping.assetId !== undefined && relevantAssetIds.has(mapping.assetId)
    );

    const nodes = await this.nodeIdsToNode3DCache.getNodesForNodeIds(
      modelId,
      revisionId,
      relevantAssetMappings.map((assetMapping) => assetMapping.nodeId)
    );

    return nodes.reduce((acc, node, index) => {
      const key = relevantAssetMappings[index].assetId;
      if (key === undefined) return acc;
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
        if (item.assetId === undefined) return;
        const key = modelRevisionNodesAssetToKey(modelId, revisionId, item.assetId);
        await this.assetIdsToAssetMappingCache.setAssetMappingsCacheItem(key, item);
      });
    });
  }

  public async getAssetMappingsForModel(
    modelId: ModelId,
    revisionId: RevisionId
  ): Promise<AssetMapping[]> {
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
  ): Promise<ChunkInCacheTypes<AssetMapping>> {
    const chunkInCache: AssetMapping[] = [];
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
  ): Promise<AssetMapping[] | undefined> {
    return type === 'nodeIds'
      ? await this.nodeIdsToAssetMappingCache.getNodeIdsToAssetMappingCacheItem(key)
      : await this.assetIdsToAssetMappingCache.getAssetIdsToAssetMappingCacheItem(key);
  }

  private setItemCacheResult(
    type: string,
    key: ModelTreeIndexKey | ModelAssetIdKey,
    item: AssetMapping[] | undefined
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
  ): Promise<AssetMapping3D[]> {
    let assetMapping3DClassic: AssetMapping3D[] = [];
    let assetMapping3DDms: AssetMapping3D[] = [];

    if (currentChunk.length === 0) {
      return [];
    }
    const filter =
      filterType === 'nodeIds' ? { nodeIds: currentChunk } : { assetIds: currentChunk };

    assetMapping3DClassic = await this._sdk.assetMappings3D
      .filter(modelId, revisionId, {
        limit: 1000,
        filter
      })
      .autoPagingToArray({ limit: Infinity });

    assetMapping3DDms = await this._sdk.assetMappings3D
      .filter(modelId, revisionId, {
        limit: 1000,
        filter,
        getDmsInstances: true
      })
      .autoPagingToArray({ limit: Infinity });

    console.log(
      'TEST fetchAssetMappingsRequest filter assetMapping3D',
      filter,
      assetMapping3DClassic,
      assetMapping3DDms
    );

    const allAssetMappings = assetMapping3DClassic.concat(assetMapping3DDms);

    await Promise.all(
      allAssetMappings
        .map(async (item) => {
          if (item.assetId === undefined) return;
          const mapping: AssetMapping = {
            ...item,
            assetId: item.assetId,
            assetInstanceId: item.assetInstanceId
          };
          const keyAssetId: ModelAssetIdKey = modelRevisionNodesAssetToKey(
            modelId,
            revisionId,
            item.assetId
          );
          const keyNodeId = modelRevisionNodesAssetToKey(modelId, revisionId, item.nodeId);
          await this.assetIdsToAssetMappingCache.setAssetMappingsCacheItem(keyAssetId, mapping);
          await this.nodeIdsToAssetMappingCache.setAssetMappingsCacheItem(keyNodeId, mapping);
        })
        .filter((item) => isDefined(item))
    );

    currentChunk.forEach(async (id) => {
      const key = modelRevisionNodesAssetToKey(modelId, revisionId, id);
      const cachedResult = await this.getItemCacheResult(filterType, key);

      if (cachedResult === undefined) {
        this.setItemCacheResult(filterType, key, []);
      }
    });

    return allAssetMappings.filter(isValidAssetMapping);
  }

  private async fetchMappingsInQueue(
    index: number,
    idChunks: number[][],
    filterType: string,
    modelId: ModelId,
    revisionId: RevisionId,
    assetMappingsList: AssetMapping3D[]
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
    const mappings: AssetMapping[] = assetMappings.map((item) => {
      return {
        ...item,
        assetId: item.assetId,
        assetInstanceId: item.assetInstanceId
      };
    });
    return mappings;
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

    console.log(' TEST getAssetMappingsForNodes allAssetMappings', allAssetMappings);
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
