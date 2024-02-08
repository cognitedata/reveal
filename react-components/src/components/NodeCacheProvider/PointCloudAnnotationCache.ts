/*!
 * Copyright 2024 Cognite AS
 */

import { type ModelRevisionKey, type ModelId, type RevisionId } from './types';
import {
  type AnnotationModel,
  type AnnotationFilterProps,
  type CogniteClient,
  type Asset
} from '@cognite/sdk';
import { modelRevisionToKey } from './utils';
import { chunk, uniqBy } from 'lodash';
import { getAssetIdOrExternalIdFromAnnotation } from '../../utilities/getAssetIdOrExternalIdFromAnnotation';
import { filterUndefined } from '../../utilities/filterUndefined';
import assert from 'assert';

export class PointCloudAnnotationCache {
  private readonly _sdk: CogniteClient;
  private readonly _modelToAnnotationAssetMappings = new Map<
    ModelRevisionKey,
    Promise<Map<number, Asset>>
  >();

  private readonly _modelToAnnotationMappings = new Map<ModelRevisionKey, AnnotationModel[]>();

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

    return await this.fetchAndCacheAssetMappingsForModel(modelId, revisionId);
  }

  public async getPointCloudAnnotationsForModel(
    modelId: ModelId,
    revisionId: RevisionId
  ): Promise<AnnotationModel[]> {
    const key = modelRevisionToKey(modelId, revisionId);
    const cachedResult = this._modelToAnnotationMappings.get(key);

    if (cachedResult !== undefined) {
      return cachedResult;
    }

    const annotationModels = await this.fetchAnnotationForModel(modelId);
    const filteredAnnotationModels = filterUndefined(annotationModels);
    const filteredAnnotationModelsByAsset = filteredAnnotationModels.filter((annotation) => {
      return getAssetIdOrExternalIdFromAnnotation(annotation) !== undefined;
    });

    this._modelToAnnotationMappings.set(key, filteredAnnotationModelsByAsset);

    return filteredAnnotationModelsByAsset;
  }

  private async fetchAndCacheAssetMappingsForModel(
    modelId: ModelId,
    revisionId: RevisionId
  ): Promise<Map<number, Asset>> {
    const key = modelRevisionToKey(modelId, revisionId);
    const annotationModels = await this.fetchAnnotationForModel(modelId);
    const annotationAssets = this.fetchPointCloudAnnotationAssets(annotationModels, this._sdk);

    this._modelToAnnotationAssetMappings.set(key, annotationAssets);
    return await annotationAssets;
  }

  private async fetchAnnotationForModel(modelId: ModelId): Promise<AnnotationModel[]> {
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
    return annotationModels;
  }

  private async fetchPointCloudAnnotationAssets(
    pointCloudAnnotations: AnnotationModel[],
    sdk: CogniteClient
  ): Promise<Map<number, Asset>> {
    const annotationMapping = pointCloudAnnotations.map((annotation) => {
      const assetId = getAssetIdOrExternalIdFromAnnotation(annotation);
      if (assetId === undefined) {
        return undefined;
      }
      return {
        annotationId: annotation.id,
        assetId
      };
    });
    const filteredAnnotationMapping = filterUndefined(annotationMapping);

    const uniqueAnnotationMapping = uniqBy(filteredAnnotationMapping, 'assetId');
    const assetIds = uniqueAnnotationMapping.map((mapping) => mapping.assetId);
    const assets = await this.fetchAssetForAssetIds(assetIds, sdk);

    const annotationIdToAssetMap = new Map<number, Asset>();
    assets.forEach((asset) => {
      uniqueAnnotationMapping.forEach((mapping) => {
        if (mapping.assetId === asset.id) {
          annotationIdToAssetMap.set(mapping.annotationId, asset);
        }
      });
    });
    return annotationIdToAssetMap;
  }

  private async fetchAssetForAssetIds(
    assetIds: Array<string | number>,
    sdk: CogniteClient
  ): Promise<Asset[]> {
    const assetsResult = await Promise.all(
      chunk(assetIds, 1000).map(async (assetIdsChunck) => {
        const retrievedAssets = await sdk.assets.retrieve(
          assetIdsChunck.map((assetId) => {
            if (typeof assetId === 'number') {
              return { id: assetId };
            } else {
              return { externalId: assetId };
            }
          }),
          { ignoreUnknownIds: true }
        );
        return retrievedAssets;
      })
    );

    return assetsResult.flat();
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
    const matchedAnnotations = Array.from(fetchedAnnotationAssetMappings.entries()).find(
      ([, asset]) => asset.id === assetIdNumber
    );
    return matchedAnnotations !== undefined ? new Map([matchedAnnotations]) : undefined;
  }
}
