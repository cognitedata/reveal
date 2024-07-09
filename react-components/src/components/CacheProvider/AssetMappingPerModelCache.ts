/*!
 * Copyright 2024 Cognite AS
 */
import { type AssetMapping3D } from '@cognite/sdk/dist/src';
import { type ModelRevisionKey } from './types';
import { type AssetMapping } from './AssetMappingAndNode3DCache';

export class AssetMappingPerModelCache {
  private readonly _modelToAssetMappings = new Map<ModelRevisionKey, Promise<AssetMapping[]>>();

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
}
