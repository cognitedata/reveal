/*!
 * Copyright 2024 Cognite AS
 */
import { type CogniteClient } from '@cognite/sdk';
import { type ModelId, type RevisionId, type ModelRevisionKey } from './types';
import { type AssetMapping } from './AssetMappingAndNode3DCache';
import { isValidAssetMapping } from './utils';
import { createModelRevisionKey } from './idAndKeyTranslation';

export class AssetMappingPerModelCache {
  private readonly _sdk: CogniteClient;

  private readonly _modelToAssetMappings = new Map<ModelRevisionKey, Promise<AssetMapping[]>>();

  constructor(sdk: CogniteClient) {
    this._sdk = sdk;
  }

  public setModelToAssetMappingCacheItems(
    key: ModelRevisionKey,
    assetMappings: Promise<AssetMapping[]>
  ): void {
    this._modelToAssetMappings.set(key, assetMappings);
  }

  public async getModelToAssetMappingCacheItems(
    key: ModelRevisionKey
  ): Promise<AssetMapping[] | undefined> {
    return await this._modelToAssetMappings.get(key);
  }

  public async fetchAndCacheMappingsForModel(
    modelId: ModelId,
    revisionId: RevisionId
  ): Promise<AssetMapping[]> {
    const key = createModelRevisionKey(modelId, revisionId);
    const assetMappings = this.fetchAssetMappingsForModel(modelId, revisionId);

    this.setModelToAssetMappingCacheItems(key, assetMappings);
    return await assetMappings;
  }

  private async fetchAssetMappingsForModel(
    modelId: ModelId,
    revisionId: RevisionId
  ): Promise<AssetMapping[]> {
    const filterQuery = {
      limit: 1000,
      getDmsInstances: true
    };

    const assetMapping3D = await this._sdk.assetMappings3D
      .list(modelId, revisionId, filterQuery)
      .autoPagingToArray({ limit: Infinity });

    const mappings = assetMapping3D.filter(isValidAssetMapping).map((mapping) => {
      const newMapping = {
        ...mapping,
        assetId: mapping.assetId,
        assetInstanceId: mapping.assetInstanceId
      };
      return newMapping;
    });
    return mappings as AssetMapping[];
  }
}
