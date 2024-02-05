/*!
 * Copyright 2024 Cognite AS
 */

import { type ModelRevisionKey, type ModelId, type RevisionId } from './types';
import {
  type AnnotationModel,
  type AnnotationFilterProps,
  type CogniteClient,
  type Asset,
  type AnnotationsBoundingVolume
} from '@cognite/sdk';
import { modelRevisionToKey } from './utils';
import { chunk, uniqBy } from 'lodash';

export class PointCloudAnnotationCache {
  private readonly _sdk: CogniteClient;
  private readonly _modelToAnnotationAssetMappings = new Map<
    ModelRevisionKey,
    Promise<Array<Map<number, Asset>>>
  >();

  private readonly _modelToAnnotationMappings = new Map<ModelRevisionKey, AnnotationModel[]>();

  constructor(sdk: CogniteClient) {
    this._sdk = sdk;
  }

  public async getPointCloudAnnotationAssetsForModel(
    modelId: ModelId,
    revisionId: RevisionId
  ): Promise<Array<Map<number, Asset>>> {
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
    const filteredAnnotationModels = annotationModels.filter((annotationModel) => {
      return (
        (annotationModel.data as AnnotationsBoundingVolume).assetRef?.id !== undefined ||
        (annotationModel.data as AnnotationsBoundingVolume).assetRef?.externalId !== undefined
      );
    });

    this._modelToAnnotationMappings.set(key, filteredAnnotationModels);

    return filteredAnnotationModels;
  }

  private async fetchAndCacheAssetMappingsForModel(
    modelId: ModelId,
    revisionId: RevisionId
  ): Promise<Array<Map<number, Asset>>> {
    const key = modelRevisionToKey(modelId, revisionId);
    const annotations = await this.fetchAnnotationForModel(modelId);
    const annotationAssets = this.fetchPointCloudAnnotationAssets(annotations, this._sdk);

    this._modelToAnnotationAssetMappings.set(key, annotationAssets);
    return await annotationAssets;
  }

  private async fetchAnnotationForModel(modelId: ModelId): Promise<AnnotationModel[]> {
    const filter: AnnotationFilterProps = {
      annotatedResourceIds: [{ id: modelId }],
      annotatedResourceType: 'threedmodel',
      annotationType: 'pointcloud.BoundingVolume'
    };
    return await this._sdk.annotations
      .list({
        filter,
        limit: 1000
      })
      .autoPagingToArray({ limit: Infinity });
  }

  private async fetchPointCloudAnnotationAssets(
    pointCloudAnnotations: AnnotationModel[],
    sdk: CogniteClient
  ): Promise<Array<Map<number, Asset>>> {
    const annotationMapping = pointCloudAnnotations
      .map((annotation) => {
        const assetId =
          (annotation.data as AnnotationsBoundingVolume).assetRef?.id ??
          (annotation.data as AnnotationsBoundingVolume).assetRef?.externalId;
        if (assetId === undefined) {
          return undefined;
        }
        return {
          annotationId: annotation.id,
          assetId
        };
      })
      .filter(
        (mapping): mapping is { annotationId: number; assetId: number } => mapping !== undefined
      );

    const uniqueAnnotationMapping = uniqBy(annotationMapping, 'assetId');

    const assetsResult = await Promise.all(
      chunk(uniqueAnnotationMapping, 1000).map(async (uniqueMappingChunk) => {
        const retrievedAssets = await sdk.assets.retrieve(
          uniqueMappingChunk.map((mapping) => {
            if (typeof mapping?.assetId === 'number') {
              return { id: mapping.assetId };
            } else {
              return { externalId: mapping?.assetId };
            }
          }),
          { ignoreUnknownIds: true }
        );
        return retrievedAssets;
      })
    );

    const assets = assetsResult.flat();
    const annotationToAssetMapping = assets.map((asset) => {
      const annotationIdToAssetMap = new Map<number, Asset>();
      uniqueAnnotationMapping.forEach((mapping) => {
        if (mapping.assetId === asset.id) {
          annotationIdToAssetMap.set(mapping.annotationId, asset);
        }
      });
      return annotationIdToAssetMap;
    });
    return annotationToAssetMapping;
  }

  public async matchPointCloudAnnotationsForModel(
    modelId: ModelId,
    revisionId: RevisionId,
    assetId: string | number
  ): Promise<Array<Map<number, Asset>>> {
    const fetchedAnnotationAssetMappings = await this.getPointCloudAnnotationAssetsForModel(
      modelId,
      revisionId
    );
    return fetchedAnnotationAssetMappings.filter((assetMap) =>
      Array.from(assetMap.values()).some((asset) => asset.id === assetId)
    );
  }
}
