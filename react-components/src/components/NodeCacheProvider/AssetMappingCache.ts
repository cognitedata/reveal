/*!
 * Copyright 2023 Cognite AS
 */

import { CogniteClient, AssetMapping3D, Node3D } from '@cognite/sdk';
import { ModelId, ModelRevisionKey, RevisionId } from './types';
import { CadModelOptions } from '../Reveal3DResources/types';
import { maxBy } from 'lodash';
import { treeIndexesToNodeIds } from './requests';
import assert from 'assert';

export class AssetMappingCache {

  private readonly _sdk: CogniteClient;

  private readonly _modelToAssetMappings = new Map<ModelRevisionKey, AssetMapping3D[]>();

  constructor(sdk: CogniteClient) {
    this._sdk = sdk;
  }

  public async getAssetMappingForAncestors(modelId: ModelId, revisionId: RevisionId, ancestors: Node3D[]): Promise<{ node: Node3D, mappings: AssetMapping3D[] } | undefined> {
    if (ancestors.length === 0) {
      return undefined;
    }

    const searchTreeIndices = new Set(ancestors.map(ancestor => ancestor.treeIndex));
    const allModelMappings = await this.getAssetMappingsForModel(modelId, revisionId);

    const relevantMappings = [...allModelMappings.values()].filter(mapping => searchTreeIndices.has(mapping.treeIndex));

    if (relevantMappings.length === 0) {
      return undefined;
    }

    const maxRelevantMappingTreeIndex = maxBy(relevantMappings, mapping => mapping.treeIndex)!.treeIndex;
    const mappingsOfNearestAncestor = relevantMappings.filter(mapping => mapping.treeIndex === maxRelevantMappingTreeIndex);

    const nearestMappedAncestor = ancestors.find(node => node.treeIndex === maxRelevantMappingTreeIndex);
    assert(nearestMappedAncestor !== undefined);

    return { node: nearestMappedAncestor, mappings: mappingsOfNearestAncestor };
  }

  public async getAssetMappingsForModel(modelId: ModelId, revisionId: RevisionId): Promise<AssetMapping3D[]> {
    const key = modelRevisionToKey(modelId, revisionId);
    const cachedResult = this._modelToAssetMappings.get(key);

    if (cachedResult !== undefined) {
      return cachedResult;
    }

    const assetMappings = await this.fetchAssetMappingsForModel(modelId, revisionId);

    this._modelToAssetMappings.set(key, assetMappings);
    return assetMappings;
  }

  private async fetchAssetMappingsForModel(modelId: ModelId, revisionId: RevisionId): Promise<AssetMapping3D[]> {
    return this._sdk.assetMappings3D.list(modelId, revisionId).autoPagingToArray({ limit: Infinity });
  }
}

function modelRevisionToKey(modelId: ModelId, revisionId: RevisionId): ModelRevisionKey {
  return `${modelId}/${revisionId}`;
}
