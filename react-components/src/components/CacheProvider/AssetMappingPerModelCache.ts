/*!
 * Copyright 2024 Cognite AS
 */
import { type CogniteClient } from '@cognite/sdk';
import {
  type ModelId,
  type RevisionId,
  type ModelRevisionKey,
  type CdfAssetMapping
} from './types';
import { isValidAssetMapping } from './utils';
import { createModelRevisionKey } from './idAndKeyTranslation';
import { isDefined } from '../../utilities/isDefined';

export class AssetMappingPerModelCache {
  private readonly _sdk: CogniteClient;

  private readonly _modelToAssetMappings = new Map<ModelRevisionKey, Promise<CdfAssetMapping[]>>();

  private readonly isCoreDmOnly: boolean;

  constructor(sdk: CogniteClient, coreDmOnly: boolean) {
    this._sdk = sdk;
    this.isCoreDmOnly = coreDmOnly;
  }

  public setModelToAssetMappingCacheItems(
    key: ModelRevisionKey,
    assetMappings: Promise<CdfAssetMapping[]>
  ): void {
    this._modelToAssetMappings.set(key, assetMappings);
  }

  public async getModelToAssetMappingCacheItems(
    key: ModelRevisionKey
  ): Promise<CdfAssetMapping[] | undefined> {
    return await this._modelToAssetMappings.get(key);
  }

  public async fetchAndCacheMappingsForModel(
    modelId: ModelId,
    revisionId: RevisionId
  ): Promise<CdfAssetMapping[]> {
    const key = createModelRevisionKey(modelId, revisionId);
    const assetMappings = this.fetchAssetMappingsForModel(modelId, revisionId);
    this.setModelToAssetMappingCacheItems(key, assetMappings);
    return await assetMappings;
  }

  private async fetchAssetMappingsForModel(
    modelId: ModelId,
    revisionId: RevisionId
  ): Promise<CdfAssetMapping[]> {
    const assetMappingsClassic = await this.fetchAssetMappingsForModelClassic(modelId, revisionId);
    const assetMappingsHybrid = await this.fetchAssetMappingsForModelHybrid(modelId, revisionId);

    const allAssetMappings = assetMappingsClassic.concat(assetMappingsHybrid);

    return allAssetMappings;
  }

  private async fetchAssetMappingsForModelClassic(
    modelId: ModelId,
    revisionId: RevisionId
  ): Promise<CdfAssetMapping[]> {
    const filterQuery = {
      limit: 1000
    };

    const assetMappings = await this._sdk.assetMappings3D
      .list(modelId, revisionId, filterQuery)
      .autoPagingToArray({ limit: Infinity });

    return assetMappings.filter(isValidAssetMapping);
  }

  private async fetchAssetMappingsForModelHybrid(
    modelId: ModelId,
    revisionId: RevisionId
  ): Promise<CdfAssetMapping[]> {
    if (this.isCoreDmOnly) return [];

    const filterQueryHybrid = {
      limit: 1000,
      getDmsInstances: true
    };

    const assetMappings = await this._sdk.assetMappings3D
      .list(modelId, revisionId, filterQueryHybrid)
      .autoPagingToArray({ limit: Infinity });

    const requests = assetMappings.map((mapping) => ({ id: mapping.nodeId }));

    const nodes = await this.getNode3DInfoFromNodeIds(modelId, revisionId, requests);

    const mappings = assetMappings
      .map((mapping) => {
        const nodeFound = nodes.find((node) => node.id === mapping.nodeId);
        if (nodeFound === undefined) return undefined;

        const newMapping: CdfAssetMapping = {
          ...mapping,
          nodeId: mapping.nodeId,
          treeIndex: nodeFound.treeIndex,
          subtreeSize: nodeFound.subtreeSize,
          assetId: mapping.assetId,
          assetInstanceId: mapping.assetInstanceId
        };
        return newMapping;
      })
      .filter(isDefined);
    return mappings;
  }

  private async getNode3DInfoFromNodeIds(
    modelId: ModelId,
    revisionId: RevisionId,
    nodeIds: Array<{ id: number }>
  ): Promise<Array<{ treeIndex: number; subtreeSize: number; id: number }>> {
    try {
      const nodes = await this._sdk.revisions3D.retrieve3DNodes(modelId, revisionId, nodeIds);
      return nodes.map((node) => {
        return { treeIndex: node.treeIndex, subtreeSize: node.subtreeSize, id: node.id };
      });
    } catch (error) {
      console.error('Error fetching node3DInfo', error);
      return [];
    }
  }
}
