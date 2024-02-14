/*!
 * Copyright 2024 Cognite AS
 */

import {
  type ModelRevisionKey,
  type ModelId,
  type RevisionId,
  type RevealAnnotationModel
} from './types';
import { type CogniteClient, type Asset, type AnnotationFilterProps } from '@cognite/sdk';
import { getAssetIdOrExternalIdFromAnnotation, modelRevisionToKey } from './utils';
import { fetchAnnotationAssets } from './AnnotationModelUtils';
import assert from 'assert';

export class PointCloudAnnotationCache {
  private readonly _sdk: CogniteClient;
  private readonly _modelToAnnotationAssetMappings = new Map<
    ModelRevisionKey,
    Promise<Map<number, Asset>>
  >();

  private readonly _modelToAnnotationMappings = new Map<
    ModelRevisionKey,
    RevealAnnotationModel[]
  >();

  constructor(sdk: CogniteClient) {
    this._sdk = sdk;
  }

  public async getPointCloudAnnotationAssetsForModel(
    modelId: ModelId,
    revisionId: RevisionId
  ): Promise<Map<number, Asset>> {
    const key = modelRevisionToKey(modelId, revisionId);
    const cachedResult = this._modelToAnnotationAssetMappings.get(key);

    if (cachedResult !== undefined) {
      return await cachedResult;
    }

    const modelToAnnotationAssetMappings = this.fetchAndCacheAssetMappingsForModel(modelId);
    this._modelToAnnotationAssetMappings.set(key, modelToAnnotationAssetMappings);

    return await modelToAnnotationAssetMappings;
  }

  public async getPointCloudAnnotationsForModel(
    modelId: ModelId,
    revisionId: RevisionId
  ): Promise<RevealAnnotationModel[]> {
    const key = modelRevisionToKey(modelId, revisionId);
    const cachedResult = this._modelToAnnotationMappings.get(key);

    if (cachedResult !== undefined) {
      return cachedResult;
    }

    const annotationModels = await this.fetchAnnotationForModel(modelId);

    this._modelToAnnotationMappings.set(key, annotationModels);

    return annotationModels;
  }

  private async fetchAndCacheAssetMappingsForModel(modelId: ModelId): Promise<Map<number, Asset>> {
    const annotationModels = await this.fetchAnnotationForModel(modelId);
    const annotationAssets = fetchAnnotationAssets(annotationModels, this._sdk);

    return await annotationAssets;
  }

  private async fetchAnnotationForModel(modelId: ModelId): Promise<RevealAnnotationModel[]> {
    const filter: AnnotationFilterProps = {
      annotatedResourceIds: [{ id: modelId }],
      annotatedResourceType: 'threedmodel',
      annotationType: 'pointcloud.BoundingVolume'
    };
    const annotationModels = await this._sdk.annotations
      .list({
        filter,
        limit: 1000
      })
      .autoPagingToArray({ limit: Infinity });
    assert(
      annotationModels.every(
        (annotationModel) => annotationModel.annotationType === 'pointcloud.BoundingVolume'
      )
    );
    const filteredAnnotationModelsByAsset = annotationModels.filter((annotation) => {
      return getAssetIdOrExternalIdFromAnnotation(annotation) !== undefined;
    });
    return filteredAnnotationModelsByAsset as RevealAnnotationModel[];
  }

  public async matchPointCloudAnnotationsForModel(
    modelId: ModelId,
    revisionId: RevisionId,
    assetId: string | number
  ): Promise<Map<number, Asset> | undefined> {
    const fetchedAnnotationAssetMappings = await this.getPointCloudAnnotationAssetsForModel(
      modelId,
      revisionId
    );

    const assetIdNumber = typeof assetId === 'number' ? assetId : undefined;
    const matchedAnnotations = Array.from(fetchedAnnotationAssetMappings.entries()).filter(
      ([, asset]) => asset.id === assetIdNumber
    );
    return matchedAnnotations.length > 0 ? new Map(matchedAnnotations) : undefined;
  }
}
