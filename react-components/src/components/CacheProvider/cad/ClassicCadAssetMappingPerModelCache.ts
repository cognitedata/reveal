import { type CogniteClient } from '@cognite/sdk';
import { type ModelId, type RevisionId, type ModelRevisionKey } from '../types';
import { createModelRevisionKey } from '../idAndKeyTranslation';
import { type HybridCadAssetMapping } from './assetMappingTypes';
import {
  convertToHybridAssetMapping,
  type RawCdfHybridCadAssetMapping
} from './rawAssetMappingTypes';
import { isDefined } from '../../../utilities/isDefined';

export class ClassicCadAssetMappingPerModelCache {
  private readonly _sdk: CogniteClient;

  private readonly _modelToAssetMappings = new Map<
    ModelRevisionKey,
    Promise<HybridCadAssetMapping[]>
  >();

  constructor(sdk: CogniteClient) {
    this._sdk = sdk;
  }

  private setModelToAssetMappingCacheItems(
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
  ): Promise<HybridCadAssetMapping[]> {
    const classicAssetMappings: RawCdfHybridCadAssetMapping[] = await this._sdk.assetMappings3D
      .list(modelId, revisionId, { limit: 1000 })
      .autoPagingToArray({ limit: Infinity });
    const dmAssetMappings: RawCdfHybridCadAssetMapping[] = await this._sdk.assetMappings3D
      .list(modelId, revisionId, { limit: 1000, getDmsInstances: true })
      .autoPagingToArray({ limit: Infinity });

    return [...classicAssetMappings, ...dmAssetMappings]
      .map(convertToHybridAssetMapping)
      .filter(isDefined);
  }
}
