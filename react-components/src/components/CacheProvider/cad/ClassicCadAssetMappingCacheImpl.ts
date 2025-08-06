import { type CogniteClient, type Node3D } from '@cognite/sdk';
import {
  type ModelId,
  type RevisionId,
  type ChunkInCacheTypes,
  type NodeId,
  type ModelInstanceIdKey,
  type ModelNodeIdKey
} from '../types';
import { chunk, maxBy } from 'lodash';
import assert from 'assert';
import {
  createModelInstanceIdKey,
  createModelRevisionKey,
  createInstanceKey,
  createModelNodeIdKey
} from '../idAndKeyTranslation';
import { type ModelWithAssetMappings } from '../../../hooks/cad/modelWithAssetMappings';
import { ClassicCadAssetMappingPerAssetIdCache } from './ClassicCadAssetMappingPerAssetIdCache';
import { ClassicCadAssetMappingPerNodeIdCache } from './ClassicCadAssetMappingPerNodeIdCache';
import { ClassicCadNode3DPerNodeIdCache } from './ClassicCadNode3DPerNodeIdCache';
import { ClassicCadAssetMappingPerModelCache } from './ClassicCadAssetMappingPerModelCache';
import {
  type HybridCadNodeAssetMappingResult,
  type ClassicCadAssetMappingCache
} from './ClassicCadAssetMappingCache';
import { type InstanceId, type InstanceKey } from '../../../utilities/instanceIds';
import {
  getMappingInstanceId,
  type HybridCadAssetMapping,
  type HybridCadAssetTreeIndexMapping
} from './assetMappingTypes';
import { type HybridCadCacheIndexType } from './types';
import { convertToHybridAssetMapping } from './rawAssetMappingTypes';
import { isDefined } from '../../../utilities/isDefined';

export function createClassicCadAssetMappingCache(sdk: CogniteClient): ClassicCadAssetMappingCache {
  return new ClassicCadAssetMappingCacheImpl(sdk);
}

class ClassicCadAssetMappingCacheImpl implements ClassicCadAssetMappingCache {
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
  ): Promise<HybridCadNodeAssetMappingResult> {
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

  public async getNodesForInstanceIds(
    modelId: ModelId,
    revisionId: RevisionId,
    instanceIds: InstanceId[]
  ): Promise<Map<InstanceKey, Node3D[]>> {
    const relevantAssetIds = new Set(instanceIds.map(createInstanceKey));

    const assetIdsList = Array.from(relevantAssetIds);
    const chunkSize = Math.round(assetIdsList.length / this._amountOfAssetIdsChunks);
    const listChunks = chunk(assetIdsList, chunkSize);

    const allAssetMappingsReturned = listChunks.map(async (itemChunk) => {
      const assetMappings = await this.getAssetMappingsForInstanceIds(
        modelId,
        revisionId,
        itemChunk
      );
      return assetMappings;
    });

    const allAssetMappings = await Promise.all(allAssetMappingsReturned);
    const assetMappings = allAssetMappings.flat();

    const relevantAssetMappings = assetMappings.filter((mapping) =>
      relevantAssetIds.has(createInstanceKey(getMappingInstanceId(mapping)))
    );

    const nodes = await this.nodeIdsToNode3DCache.getNodesForNodeIds(
      modelId,
      revisionId,
      relevantAssetMappings.map((assetMapping) => assetMapping.nodeId)
    );

    return nodes.reduce((acc, node, index) => {
      const key = createInstanceKey(getMappingInstanceId(relevantAssetMappings[index]));
      const nodesForAsset = acc.get(key);

      if (nodesForAsset !== undefined) {
        nodesForAsset.push(node);
      } else {
        acc.set(key, [node]);
      }

      return acc;
    }, new Map<InstanceKey, Node3D[]>());
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
    const cachingPromises = assetMappingsPerModel.flatMap((modelMapping) =>
      modelMapping.assetMappings.map(async (item) => {
        const key = createModelInstanceIdKey(
          modelId,
          revisionId,
          createInstanceKey(getMappingInstanceId(item))
        );
        await this.assetIdsToAssetMappingCache.setAssetMappingsCacheItem(key, item);
      })
    );

    await Promise.all(cachingPromises);
  }

  public async getAssetMappingsForModel(
    modelId: ModelId,
    revisionId: RevisionId
  ): Promise<HybridCadAssetMapping[]> {
    const key = createModelRevisionKey(modelId, revisionId);
    const cachedResult = await this.modelToAssetMappingsCache.getModelToAssetMappingCacheItems(key);

    if (cachedResult !== undefined) {
      return cachedResult;
    }

    return await this.modelToAssetMappingsCache.fetchAndCacheMappingsForModel(modelId, revisionId);
  }

  private async splitChunkInCacheAssetMappings<KeyType extends InstanceKey>(
    currentChunk: KeyType[],
    modelId: ModelId,
    revisionId: RevisionId,
    type: HybridCadCacheIndexType
  ): Promise<ChunkInCacheTypes<HybridCadAssetMapping, KeyType>> {
    const chunkInCache: HybridCadAssetMapping[] = [];
    const chunkNotCached: KeyType[] = [];

    await Promise.all(
      currentChunk.map(async (id) => {
        const key = createModelInstanceIdKey(modelId, revisionId, id);
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
    type: HybridCadCacheIndexType,
    key: ModelNodeIdKey | ModelInstanceIdKey
  ): Promise<HybridCadAssetMapping[] | undefined> {
    return type === 'nodeIds'
      ? await this.nodeIdsToAssetMappingCache.getNodeIdsToAssetMappingCacheItem(key)
      : await this.assetIdsToAssetMappingCache.getAssetIdsToAssetMappingCacheItem(key);
  }

  private setItemCacheResult(
    type: HybridCadCacheIndexType,
    key: ModelNodeIdKey | ModelInstanceIdKey,
    item: HybridCadAssetMapping[] | undefined
  ): void {
    const value = Promise.resolve(item ?? []);
    type === 'nodeIds'
      ? this.nodeIdsToAssetMappingCache.setNodeIdsToAssetMappingCacheItem(key, value)
      : this.assetIdsToAssetMappingCache.setAssetIdsToAssetMappingCacheItem(key, value);
  }

  private async fetchAssetMappingsRequest(
    currentChunk: InstanceKey[],
    filterType: HybridCadCacheIndexType,
    modelId: ModelId,
    revisionId: RevisionId
  ): Promise<HybridCadAssetMapping[]> {
    // TODO(BND3D-5837): The asset mappings filter endpoint does not support lookups by DM ids, only assetIds + nodeIds
    const numericalIdChunk = currentChunk.filter((key) => typeof key === 'number');
    if (numericalIdChunk.length === 0) {
      return [];
    }

    const filter =
      filterType === 'nodeIds' ? { nodeIds: numericalIdChunk } : { assetIds: numericalIdChunk };

    const classicPromise = this._sdk.assetMappings3D
      .filter(modelId, revisionId, {
        limit: 1000,
        filter
      })
      .autoPagingToArray({ limit: Infinity });

    const filterOptions = {
      limit: 1000,
      filter,
      getDmsInstances: true
    };

    const hybridPromise = this._sdk.assetMappings3D
      .filter(modelId, revisionId, filterOptions)
      .autoPagingToArray({ limit: Infinity });

    const [classicResult, hybridResult] = await Promise.all([classicPromise, hybridPromise]);

    const classicAssetMapping3D = classicResult.map(convertToHybridAssetMapping).filter(isDefined);
    const hybridAssetMapping3D = hybridResult.map(convertToHybridAssetMapping).filter(isDefined);

    const assetMapping3D = [...classicAssetMapping3D, ...hybridAssetMapping3D];

    await Promise.all(
      assetMapping3D.map(async (assetMapping) => {
        const keyAssetId: ModelInstanceIdKey = createModelInstanceIdKey(
          modelId,
          revisionId,
          createInstanceKey(getMappingInstanceId(assetMapping))
        );
        const keyNodeId = createModelNodeIdKey(modelId, revisionId, assetMapping.nodeId);
        await this.assetIdsToAssetMappingCache.setAssetMappingsCacheItem(keyAssetId, assetMapping);
        await this.nodeIdsToAssetMappingCache.setAssetMappingsCacheItem(keyNodeId, assetMapping);
      })
    );

    currentChunk.forEach(async (id) => {
      const key = createModelInstanceIdKey(modelId, revisionId, id);
      const cachedResult = await this.getItemCacheResult(filterType, key);

      if (cachedResult === undefined) {
        this.setItemCacheResult(filterType, key, []);
      }
    });

    return assetMapping3D;
  }

  private async fetchMappingsInQueue(
    index: number,
    idChunks: Array<Array<InstanceKey | NodeId>>,
    filterType: HybridCadCacheIndexType,
    modelId: ModelId,
    revisionId: RevisionId,
    assetMappingsList: HybridCadAssetMapping[]
  ): Promise<HybridCadAssetMapping[]> {
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
    ids: InstanceKey[],
    filterType: HybridCadCacheIndexType
  ): Promise<HybridCadAssetMapping[]> {
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
  ): Promise<HybridCadAssetMapping[]> {
    const nodeIds = nodes.map((node) => node.id);

    const { chunkNotInCache, chunkInCache } = await this.splitChunkInCacheAssetMappings(
      nodeIds,
      modelId,
      revisionId,
      'nodeIds'
    );

    const notCachedNodeIds: NodeId[] = chunkNotInCache;

    const assetMappings = await this.fetchAndCacheMappingsForIds(
      modelId,
      revisionId,
      notCachedNodeIds,
      'nodeIds'
    );

    const allAssetMappings = chunkInCache.concat(assetMappings);
    return allAssetMappings;
  }

  private async getAssetMappingsForInstanceIds(
    modelId: ModelId,
    revisionId: RevisionId,
    instanceIds: InstanceKey[]
  ): Promise<HybridCadAssetMapping[]> {
    const { chunkNotInCache, chunkInCache } = await this.splitChunkInCacheAssetMappings(
      instanceIds,
      modelId,
      revisionId,
      'assetIds'
    );

    const notCachedAssetIds = chunkNotInCache;

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
