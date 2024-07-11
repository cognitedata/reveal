/*!
 * Copyright 2024 Cognite AS
 */
import { type CogniteClient, type AssetMapping3D } from '@cognite/sdk/dist/src';
import { type ModelId, type RevisionId, type ModelRevisionKey } from './types';
import { type AssetMapping } from './AssetMappingAndNode3DCache';
import { isValidAssetMapping, modelRevisionToKey } from './utils';

export class AssetMappingPerModelCache {
  private readonly _sdk: CogniteClient;

  private readonly _modelToAssetMappings = new Map<ModelRevisionKey, Promise<AssetMapping[]>>();

  constructor(sdk: CogniteClient) {
    this._sdk = sdk;
  }

  public setModelToAssetMappingCacheItems(
    key: ModelRevisionKey,
    assetMappings: Promise<Array<Required<AssetMapping3D>>>
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
    const key = modelRevisionToKey(modelId, revisionId);
    const assetMappings = this.fetchAssetMappingsForModel(modelId, revisionId);

    this.setModelToAssetMappingCacheItems(key, assetMappings);
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
