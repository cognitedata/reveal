/*!
 * Copyright 2024 Cognite AS
 */
import { type CogniteClient, type AssetMapping3D } from '@cognite/sdk';
import { type ModelId, type RevisionId, type ModelRevisionKey } from './types';
import { type FiltersTypeForAssetMappings, type AssetMapping } from './AssetMappingAndNode3DCache';
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
    revisionId: RevisionId,
    filter: FiltersTypeForAssetMappings | undefined
  ): Promise<AssetMapping[]> {
    const key = createModelRevisionKey(modelId, revisionId);
    const assetMappings = this.fetchAssetMappingsForModel(modelId, revisionId, filter);

    this.setModelToAssetMappingCacheItems(key, assetMappings);
    return await assetMappings;
  }

  private async fetchAssetMappingsForModel(
    modelId: ModelId,
    revisionId: RevisionId,
    filter: FiltersTypeForAssetMappings | undefined
  ): Promise<AssetMapping[]> {
    const assetMappings =
      filter !== undefined
        ? this.fetchAssetMappingsForModelWithFilter(modelId, revisionId, filter)
        : this.fetchAssetMappingsForModelWithoutFilter(modelId, revisionId);
    return await assetMappings;
  }

  private async fetchAssetMappingsForModelWithoutFilter(
    modelId: ModelId,
    revisionId: RevisionId
  ): Promise<AssetMapping[]> {
    const assetMapping3D = await this._sdk.assetMappings3D
      .list(modelId, revisionId, {
        limit: 1000
      })
      .autoPagingToArray({ limit: Infinity });

    return assetMapping3D.filter(isValidAssetMapping);
  }

  private async fetchAssetMappingsForModelWithFilter(
    modelId: ModelId,
    revisionId: RevisionId,
    filter: FiltersTypeForAssetMappings
  ): Promise<AssetMapping[]> {
    const assetMapping3D = await this._sdk.assetMappings3D
      .filter(modelId, revisionId, {
        limit: 1000,
        filter
      })
      .autoPagingToArray({ limit: Infinity });

    return assetMapping3D.filter(isValidAssetMapping);
  }
}
