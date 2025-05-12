/*!
 * Copyright 2023 Cognite AS
 */

import {
  type CogniteClient,
  type Node3D,
  type CogniteInternalId,
  type AssetMappings3DAssetFilter,
  type AssetMappings3DNodeFilter,
  type AssetMappings3DTreeIndexFilter,
  type CogniteExternalId,
  AssetMapping3D
} from '@cognite/sdk';
import {
  type ModelTreeIndexKey,
  type AssetId,
  type ModelId,
  type RevisionId,
  type ChunkInCacheTypes,
  type ModelAssetIdKey,
  type ModelDMSUniqueInstanceKey,
  type NodeAssetMappingResult,
  type CdfAssetMapping
} from './types';
import { chunk, maxBy } from 'lodash';
import assert from 'assert';
import { convertAssetMapping3DToCdfAssetMapping, isValidAssetMapping } from './utils';
import {
  modelRevisionNodesAssetToKey,
  createModelRevisionKey,
  createModelDMSUniqueInstanceKey,
  createFdmKey
} from './idAndKeyTranslation';
import { type ModelWithAssetMappings } from '../../hooks/cad/ModelWithAssetMappings';
import { AssetMappingPerAssetIdCache } from './AssetMappingPerAssetIdCache';
import { AssetMappingPerNodeIdCache } from './AssetMappingPerNodeIdCache';
import { Node3DPerNodeIdCache } from './Node3DPerNodeIdCache';
import { AssetMappingPerModelCache } from './AssetMappingPerModelCache';
import { isDefined } from '../../utilities/isDefined';
import { type DmsUniqueIdentifier } from '../../data-providers';
import { AssetMappingHybridPerAssetInstanceIdCache } from './AssetMappingHybridPerAssetInstanceIdCache';
import { isDmsInstance } from '../../utilities/instanceIds';

export class AssetMappingAndNode3DCache {
  private readonly _sdk: CogniteClient;

  private readonly modelToAssetMappingsCache: AssetMappingPerModelCache;

  private readonly assetIdsToAssetMappingCache: AssetMappingPerAssetIdCache;

  private readonly assetInstanceIdsToAssetMappingCache: AssetMappingHybridPerAssetInstanceIdCache;

  private readonly nodeIdsToAssetMappingCache: AssetMappingPerNodeIdCache;

  private readonly nodeIdsToNode3DCache: Node3DPerNodeIdCache;

  private readonly _amountOfAssetIdsChunks = 1;

  private readonly isCoreDmOnly: boolean;

  constructor(sdk: CogniteClient, coreDmOnly: boolean) {
    this._sdk = sdk;
    this.assetIdsToAssetMappingCache = new AssetMappingPerAssetIdCache();
    this.assetInstanceIdsToAssetMappingCache = new AssetMappingHybridPerAssetInstanceIdCache();
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
    const allNodeMappings = await this.getAssetMappingsForNodes(
      modelId,
      revisionId,
      ancestors
    );

    const relevantMappings = allNodeMappings.filter(
      (mapping) => mapping.treeIndex !== undefined && searchTreeIndices.has(mapping.treeIndex)
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

    const classicAssetMappingsReturned = listChunks.map(async (itemChunk) => {
      const assetMappings = await this.getAssetMappingsForAssetIds(modelId, revisionId, itemChunk);
      return assetMappings;
    });

    const classicAssetMappings = await Promise.all(classicAssetMappingsReturned);

    const relevantClassicAssetMappings = classicAssetMappings
      .flat()
      .filter((mapping) => mapping.assetId !== undefined && relevantAssetIds.has(mapping.assetId));

    const nodes = await this.nodeIdsToNode3DCache.getNodesForNodeIds(
      modelId,
      revisionId,
      relevantClassicAssetMappings.map((assetMapping) => assetMapping.nodeId)
    );

    return nodes.reduce((acc, node, index) => {
      const key = relevantClassicAssetMappings[index].assetId;
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

  public async getNodesForAssetInstancesInHybridMappings(
    modelId: ModelId,
    revisionId: RevisionId,
    assetMappings: CdfAssetMapping[]
  ): Promise<Map<CogniteExternalId, Node3D[]>> {
    const nodes = await this.nodeIdsToNode3DCache.getNodesForNodeIds(
      modelId,
      revisionId,
      assetMappings.map(({ nodeId }) => nodeId)
    );

    return nodes.reduce((acc, node, index) => {
      const instanceId = assetMappings[index].assetInstanceId;
      if (instanceId === undefined) return acc;
      const key = createFdmKey(instanceId);
      if (key === undefined) return acc;
      const nodesForAsset = acc.get(key);

      if (nodesForAsset !== undefined) {
        nodesForAsset.push(node);
      } else {
        acc.set(key, [node]);
      }

      return acc;
    }, new Map<CogniteExternalId, Node3D[]>());
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
        const keyNodeId = modelRevisionNodesAssetToKey(modelId, revisionId, item.nodeId);
        await this.nodeIdsToAssetMappingCache.setAssetMappingsCacheItem(keyNodeId, item);
        if (item.assetId !== undefined) {
          const key = modelRevisionNodesAssetToKey(modelId, revisionId, item.assetId);
          await this.assetIdsToAssetMappingCache.setAssetMappingsCacheItem(key, item);
        } else if (item.assetInstanceId !== undefined) {
          const key = createModelDMSUniqueInstanceKey(
            modelId,
            revisionId,
            item.assetInstanceId.space,
            item.assetInstanceId.externalId
          );
          await this.assetInstanceIdsToAssetMappingCache.setHybridAssetMappingsCacheItem(key, item);
        }
      });
    });
  }

  public async getAssetMappingsForModel(
    modelId: ModelId,
    revisionId: RevisionId
  ): Promise<CdfAssetMapping[]> {
    const key = createModelRevisionKey(modelId, revisionId);
    const cachedResult = await this.modelToAssetMappingsCache.getModelToAssetMappingCacheItems(key);

    if (cachedResult !== undefined) {
      return cachedResult;
    }

    const assetMappigns = await this.modelToAssetMappingsCache.fetchAndCacheMappingsForModel(
      modelId,
      revisionId
    );

    if (cachedResult !== undefined) {
      return cachedResult;
    }
    return assetMappigns;
  }

  /**
   * Splits the current chunk of IDs into cached and non-cached classic asset mappings.
   * @param currentChunk - The current chunk of IDs to process.
   * @param modelId - The ID of the model.
   * @param revisionId - The ID of the revision.
   * @param type - The type of IDs (e.g., 'nodeIds', 'assetIds').
   * @returns An object containing cached and non-cached asset mappings.
   */
  private async splitChunkInCacheAssetMappings(
    currentChunk: number[],
    modelId: ModelId,
    revisionId: RevisionId,
    type: string
  ): Promise<ChunkInCacheTypes<CdfAssetMapping>> {
    const chunkInCache: CdfAssetMapping[] = [];
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

    return { chunkInCache, chunkNotInCacheIdClassic: chunkNotCached };
  }

  public async getItemCacheResult(
    type: string,
    key: ModelTreeIndexKey | ModelAssetIdKey
  ): Promise<CdfAssetMapping[] | undefined> {
    return type === 'nodeIds'
      ? await this.nodeIdsToAssetMappingCache.getNodeIdsToAssetMappingCacheItem(key)
      : await this.assetIdsToAssetMappingCache.getAssetIdsToAssetMappingCacheItem(key);
  }

  public setItemCacheResult(
    type: string,
    key: ModelTreeIndexKey | ModelAssetIdKey,
    item: CdfAssetMapping[] | undefined
  ): void {
    const value = Promise.resolve(item ?? []);
    type === 'nodeIds'
      ? this.nodeIdsToAssetMappingCache.setNodeIdsToAssetMappingCacheItem(key, value)
      : this.assetIdsToAssetMappingCache.setAssetIdsToAssetMappingCacheItem(key, value);
  }

  /**
   * Set the cache result for hybrid asset mappings.
   * @param key - The unique key for the asset instance.
   * @param item - The asset mapping item to set in the cache.
   */
  public setHybridItemCacheResult(
    key: ModelDMSUniqueInstanceKey,
    item: CdfAssetMapping[] | undefined
  ): void {
    const value = Promise.resolve(item ?? []);
    this.assetInstanceIdsToAssetMappingCache.setAssetInstanceIdsToHybridAssetMappingCacheItem(
      key,
      value
    );
  }

  /**
   * Get the cache result for hybrid asset mappings.
   * @param key - The unique key for the asset instance.
   * @returns The cached asset mapping item or undefined if not found.
   */
  public async getHybridItemCacheResult(
    key: ModelDMSUniqueInstanceKey
  ): Promise<CdfAssetMapping[] | undefined> {
    return await this.assetInstanceIdsToAssetMappingCache.getHybridItemCacheResult(key);
  }

  private getFilterBasedOnType(
    type: string,
    ids: Array<number | DmsUniqueIdentifier>
  ): AssetMappings3DAssetFilter | AssetMappings3DNodeFilter | AssetMappings3DTreeIndexFilter {
    if (type === 'nodeIds') {
      return { nodeIds: ids.filter((id): id is number => typeof id === 'number') };
    }
    if (type === 'assetIds') {
      return { assetIds: ids.filter((id): id is number => typeof id === 'number') };
    }
    return { assetIds: [] };
  }

  /**
   * Fetch classic and hybrid asset mappings from the server based on the provided parameters.
   * @param currentChunk - The chunk of IDs to fetch mappings for.
   * @param filterType - The type of filter to apply (e.g., 'nodeIds', 'assetIds').
   * @param modelId - The ID of the model.
   * @param revisionId - The ID of the revision.
   * @returns A promise that resolves to an array of asset mappings.
   */
  public async fetchAssetMappingsRequest(
    currentChunk: number[],
    filterType: string,
    modelId: ModelId,
    revisionId: RevisionId
  ): Promise<CdfAssetMapping[]> {
    if (currentChunk.length === 0) {
      return [];
    }

    let assetMapping3DClassic: AssetMapping3D[] = [];
    let assetMapping3DHybrid: AssetMapping3D[] = [];

    const filter = this.getFilterBasedOnType(filterType, currentChunk);

    assetMapping3DClassic = await this._sdk.assetMappings3D
      .filter(modelId, revisionId, {
        limit: 1000,
        filter
      })
      .autoPagingToArray({ limit: Infinity });

    if (filterType === 'nodeIds') {
      const filterHybrid = {
        getDmsInstances: true
      };
      assetMapping3DHybrid = await this._sdk.assetMappings3D
        .list(modelId, revisionId, filterHybrid)
        .autoPagingToArray({ limit: Infinity });
    }

    const assetMapping3DClassicConverted: CdfAssetMapping[] = assetMapping3DClassic
      .map(convertAssetMapping3DToCdfAssetMapping)
      .filter(isDefined);

    const assetMapping3DHybridConverted: CdfAssetMapping[] = assetMapping3DHybrid
      .map(convertAssetMapping3DToCdfAssetMapping)
      .filter(isDefined);

    await Promise.all([
      this.extractAndSetClassicAssetMappingsCacheItem(
        modelId,
        revisionId,
        assetMapping3DClassicConverted
      ),
      this.extractAndSetHybridAssetMappingsCacheItem(
        modelId,
        revisionId,
        assetMapping3DHybridConverted,
        currentChunk
      )
    ]);

    return assetMapping3DClassic.concat(assetMapping3DHybrid).filter(isValidAssetMapping);
  }

  /**
   * Extract and set classic asset mappings in the cache.
   * @param modelId - The ID of the model.
   * @param revisionId - The ID of the revision.
   * @param assetMapping3DClassic - The array of classic asset mappings to extract and set.
   */
  public async extractAndSetClassicAssetMappingsCacheItem(
    modelId: ModelId,
    revisionId: RevisionId,
    assetMapping3DClassic: CdfAssetMapping[]
  ): Promise<void> {
    await Promise.all(
      assetMapping3DClassic
        .filter(isValidAssetMapping)
        .map(async (item) => {
          const mapping: CdfAssetMapping = {
            ...item,
            treeIndex: item.treeIndex,
            subtreeSize: item.subtreeSize,
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
  }

  /**
   * Extract and set hybrid asset mappings in the cache.
   * @param modelId - The ID of the model.
   * @param revisionId - The ID of the revision.
   * @param assetMapping3DHybrid - The array of hybrid asset mappings to extract and set.
   * @param currentChunk - The chunk of IDs to process.
   */
  public async extractAndSetHybridAssetMappingsCacheItem(
    modelId: ModelId,
    revisionId: RevisionId,
    assetMapping3DHybrid: CdfAssetMapping[],
    currentChunk: number[]
  ): Promise<void> {
    await Promise.all(
      assetMapping3DHybrid.map(async (item) => {
        if (item.assetInstanceId === undefined) return;
        if (item.treeIndex === undefined) return;
        if (item.subtreeSize === undefined) return;
        if (currentChunk.find((id) => id === item.nodeId) === undefined) return;

        const mapping: CdfAssetMapping = {
          ...item,
          treeIndex: item.treeIndex,
          subtreeSize: item.subtreeSize,
          assetId: item.assetId,
          assetInstanceId: item.assetInstanceId
        };
        const key = createModelDMSUniqueInstanceKey(
          modelId,
          revisionId,
          item.assetInstanceId.space,
          item.assetInstanceId.externalId
        );
        await this.assetInstanceIdsToAssetMappingCache.setHybridAssetMappingsCacheItem(
          key,
          mapping
        );
      })
    );
  }

  private async fetchMappingsInQueue(
    index: number,
    idChunks: number[][],
    filterType: string,
    modelId: ModelId,
    revisionId: RevisionId,
    assetMappingsList: CdfAssetMapping[]
  ): Promise<CdfAssetMapping[]> {
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
    ids: Array<number | DmsUniqueIdentifier>,
    filterType: string
  ): Promise<CdfAssetMapping[]> {
    if (ids.length === 0) {
      return [];
    }
    const idChunks = chunk(ids, 1000);

    const numericIdChunks = idChunks.map((chunk) =>
      chunk.filter((id): id is number => typeof id === 'number')
    );

    const initialIndex = 0;
    const assetMappings = await this.fetchMappingsInQueue(
      initialIndex,
      numericIdChunks,
      filterType,
      modelId,
      revisionId,
      []
    );

    return assetMappings;
  }

  public async getAssetMappingsForNodes(
    modelId: ModelId,
    revisionId: RevisionId,
    nodes: Node3D[]
  ): Promise<CdfAssetMapping[]> {
    const nodeIds = nodes.map((node) => node.id);

    const { chunkNotInCacheIdClassic, chunkInCache } = await this.splitChunkInCacheAssetMappings(
      nodeIds,
      modelId,
      revisionId,
      'nodeIds'
    );

    if (chunkNotInCacheIdClassic === undefined || chunkNotInCacheIdClassic?.length === 0) {
      return chunkInCache;
    }
    const assetMappings = await this.fetchAndCacheMappingsForIds(
      modelId,
      revisionId,
      chunkNotInCacheIdClassic,
      'nodeIds'
    );

    const allAssetMappings = chunkInCache.concat(assetMappings);

    return allAssetMappings;
  }

  /**
   * Get classic asset mappings for the provided asset IDs.
   * @param modelId - The ID of the model.
   * @param revisionId - The ID of the revision.
   * @param assetIds - The array of asset IDs to get mappings for.
   * @returns A promise that resolves to an array of CdfAssetMapping objects.
   */
  private async getAssetMappingsForAssetIds(
    modelId: ModelId,
    revisionId: RevisionId,
    assetIds: number[]
  ): Promise<CdfAssetMapping[]> {
    const { chunkNotInCacheIdClassic, chunkInCache } = await this.splitChunkInCacheAssetMappings(
      assetIds,
      modelId,
      revisionId,
      'assetIds'
    );

    if (chunkNotInCacheIdClassic === undefined || chunkNotInCacheIdClassic?.length === 0) {
      return chunkInCache;
    }

    const assetMappings = await this.fetchAndCacheMappingsForIds(
      modelId,
      revisionId,
      chunkNotInCacheIdClassic,
      'assetIds'
    );
    const allAssetMappings = chunkInCache.concat(assetMappings);
    return allAssetMappings;
  }
}
