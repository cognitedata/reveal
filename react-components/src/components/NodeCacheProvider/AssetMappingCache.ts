/*!
 * Copyright 2023 Cognite AS
 */

import { type CogniteClient, type AssetMapping3D, type Node3D } from '@cognite/sdk';
import { type ModelId, type ModelRevisionKey, type RevisionId } from './types';
import { maxBy } from 'lodash';
import assert from 'assert';

export type NodeAssetMappingResult = { node?: Node3D; mappings: AssetMapping[] };

export type AssetMapping = Required<AssetMapping3D>;

export class AssetMappingCache {
  private readonly _sdk: CogniteClient;

  private readonly _modelToAssetMappings = new Map<ModelRevisionKey, Promise<AssetMapping[]>>();

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
    const allModelMappings = await this.getAssetMappingsForModel(modelId, revisionId);

    const relevantMappings = allModelMappings.filter((mapping) =>
      searchTreeIndices.has(mapping.treeIndex)
    );

    if (relevantMappings.length === 0) {
      return { mappings: [] };
    }

    const maxRelevantMappingTreeIndex = maxBy(relevantMappings, (mapping) => mapping.treeIndex)
      ?.treeIndex;

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

function modelRevisionToKey(modelId: ModelId, revisionId: RevisionId): ModelRevisionKey {
  return `${modelId}/${revisionId}`;
}
