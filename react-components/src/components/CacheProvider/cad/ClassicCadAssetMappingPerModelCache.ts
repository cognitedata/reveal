import { type CogniteClient } from '@cognite/sdk';
import { type ModelId, type RevisionId, type ModelRevisionKey } from '../types';
import { createModelRevisionKey } from '../idAndKeyTranslation';
import { type HybridCadAssetMapping } from './assetMappingTypes';
import {
  extractHybridAssetMappings,
  type RawCdfHybridCadAssetMapping
} from './rawAssetMappingTypes';

export class ClassicCadAssetMappingPerModelCache {
  private readonly _sdk: CogniteClient;

  private readonly _modelToAssetMappings = new Map<
    ModelRevisionKey,
    Promise<HybridCadAssetMapping[]>
  >();

  constructor(sdk: CogniteClient) {
    this._sdk = sdk;
  }

  public setModelToAssetMappingCacheItems(
    key: ModelRevisionKey,
    assetMappings: Promise<HybridCadAssetMapping[]>
  ): void {
    this._modelToAssetMappings.set(key, assetMappings);
  }

  public async getModelToAssetMappingCacheItems(
    key: ModelRevisionKey
  ): Promise<HybridCadAssetMapping[] | undefined> {
    return await this._modelToAssetMappings.get(key);
  }

  public async fetchAndCacheMappingsForModel(
    modelId: ModelId,
    revisionId: RevisionId
  ): Promise<HybridCadAssetMapping[]> {
    const key = createModelRevisionKey(modelId, revisionId);
    const assetMappings = this.fetchAssetMappingsForModel(modelId, revisionId);

    this.setModelToAssetMappingCacheItems(key, assetMappings);
    return await assetMappings;
  }

  private async fetchAssetMappingsForModel(
    modelId: ModelId,
    revisionId: RevisionId
  ): Promise<ClassicCadAssetMapping[]> {
    const assetMapping3D = await this._sdk.assetMappings3D
      .list(modelId, revisionId, { limit: 1000 })
      .autoPagingToArray({ limit: Infinity });

    return assetMapping3D.filter(isValidClassicCadAssetMapping);
  }
}
