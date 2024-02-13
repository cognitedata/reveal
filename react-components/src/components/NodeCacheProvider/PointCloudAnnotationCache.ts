/*!
 * Copyright 2024 Cognite AS
 */

import {
  type ModelRevisionKey,
  type ModelId,
  type RevisionId,
  type PointCloudAnnotationModel
} from './types';
import {
  type AnnotationFilterProps,
  type CogniteClient,
  type Asset,
  type AnnotationModel,
  type AnnotationsBoundingVolume
} from '@cognite/sdk';
import { modelRevisionToKey } from './utils';
import { chunk, uniqBy } from 'lodash';
import { filterUndefined } from '../../utilities/filterUndefined';
import assert from 'assert';

export class PointCloudAnnotationCache {
  private readonly _sdk: CogniteClient;
  private readonly _modelToAnnotationAssetMappings = new Map<
    ModelRevisionKey,
    Promise<Map<number, Asset>>
  >();

  private readonly _modelToAnnotationMappings = new Map<
    ModelRevisionKey,
    PointCloudAnnotationModel[]
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

    const modelToAnnotationAssetMappings = this.fetchAndCacheAssetMappingsForModel(
      modelId,
      revisionId
    );
    this._modelToAnnotationAssetMappings.set(key, modelToAnnotationAssetMappings);

    return await modelToAnnotationAssetMappings;
  }

  public async getPointCloudAnnotationsForModel(
    modelId: ModelId,
    revisionId: RevisionId
  ): Promise<PointCloudAnnotationModel[]> {
    const key = modelRevisionToKey(modelId, revisionId);
    const cachedResult = this._modelToAnnotationMappings.get(key);

    if (cachedResult !== undefined) {
      return cachedResult;
    }

    const annotationModels = await this.fetchAnnotationForModel(modelId);

    this._modelToAnnotationMappings.set(key, annotationModels);

    return annotationModels;
  }

  private async fetchAndCacheAssetMappingsForModel(
    modelId: ModelId,
    revisionId: RevisionId
  ): Promise<Map<number, Asset>> {
    const annotationModels = await this.fetchAnnotationForModel(modelId);
    const annotationAssets = this.fetchPointCloudAnnotationAssets(annotationModels, this._sdk);

    return await annotationAssets;
  }

  private async fetchAnnotationForModel(modelId: ModelId): Promise<PointCloudAnnotationModel[]> {
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
      return this.getAssetIdOrExternalIdFromAnnotation(annotation) !== undefined;
    });
    return filteredAnnotationModelsByAsset as PointCloudAnnotationModel[];
  }

  private async fetchPointCloudAnnotationAssets(
    pointCloudAnnotations: PointCloudAnnotationModel[],
    sdk: CogniteClient
  ): Promise<Map<number, Asset>> {
    const annotationMapping = pointCloudAnnotations.map((annotation) => {
      const assetId = this.getAssetIdOrExternalIdFromAnnotation(annotation);
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
      filteredAnnotationMapping.forEach((mapping) => {
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
    const matchedAnnotations = Array.from(fetchedAnnotationAssetMappings.entries()).filter(
      ([, asset]) => asset.id === assetIdNumber
    );
    return matchedAnnotations.length > 0 ? new Map(matchedAnnotations) : undefined;
  }

  private getAssetIdOrExternalIdFromAnnotation(
    annotation: AnnotationModel
  ): string | number | undefined {
    return (
      (annotation.data as AnnotationsBoundingVolume).assetRef?.id ??
      (annotation.data as AnnotationsBoundingVolume).assetRef?.externalId
    );
  }
}
