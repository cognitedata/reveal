import {
  type ModelRevisionKey,
  type ModelId,
  type RevisionId,
  type PointCloudAnnotationModel,
  type AnnotationId
} from './types';
import { type CogniteClient, type AnnotationFilterProps } from '@cognite/sdk';
import { getInstanceReferencesFromPointCloudAnnotation } from './utils';
import { fetchPointCloudAnnotationAssets } from './annotationModelUtils';
import assert from 'assert';
import { createModelRevisionKey } from './idAndKeyTranslation';
import { type AssetInstance } from '../../utilities/instances';
import { type InstanceReference, isSameAssetReference } from '../../utilities/instanceIds';

type PointCloudAnnotationCacheDependencies = {
  fetchAnnotationAssets: typeof fetchPointCloudAnnotationAssets;
};
export class PointCloudAnnotationCache {
  private readonly _sdk: CogniteClient;
  private readonly _modelToAnnotationAssetMappings = new Map<
    ModelRevisionKey,
    Promise<Map<AnnotationId, AssetInstance[]>>
  >();

  private readonly _modelToAnnotationMappings = new Map<
    ModelRevisionKey,
    PointCloudAnnotationModel[]
  >();

  private readonly fetchAnnotationAssets: typeof fetchPointCloudAnnotationAssets;

  constructor(sdk: CogniteClient, dependencies?: PointCloudAnnotationCacheDependencies) {
    this._sdk = sdk;

    const { fetchAnnotationAssets } = dependencies ?? {
      fetchAnnotationAssets: fetchPointCloudAnnotationAssets
    };
    this.fetchAnnotationAssets = fetchAnnotationAssets;
  }

  private async getPointCloudAnnotationAssetsForModel(
    modelId: ModelId,
    revisionId: RevisionId
  ): Promise<Map<AnnotationId, AssetInstance[]>> {
    const key = createModelRevisionKey(modelId, revisionId);
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
  ): Promise<PointCloudAnnotationModel[]> {
    const key = createModelRevisionKey(modelId, revisionId);
    const cachedResult = this._modelToAnnotationMappings.get(key);

    if (cachedResult !== undefined) {
      return cachedResult;
    }

    const annotationModels = await this.fetchAnnotationForModel(modelId);

    this._modelToAnnotationMappings.set(key, annotationModels);

    return annotationModels;
  }

  private async fetchAndCacheAssetMappingsForModel(
    modelId: ModelId
  ): Promise<Map<AnnotationId, AssetInstance[]>> {
    const annotationModels = await this.fetchAnnotationForModel(modelId);
    const annotationAssets = this.fetchAnnotationAssets(annotationModels, this._sdk);

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
    const filteredAnnotationModelsByAsset = annotationModels.filter(
      (annotation) => getInstanceReferencesFromPointCloudAnnotation(annotation).length !== 0
    );
    return filteredAnnotationModelsByAsset as PointCloudAnnotationModel[];
  }

  public async matchPointCloudAnnotationsForModel(
    modelId: ModelId,
    revisionId: RevisionId,
    assetId: InstanceReference
  ): Promise<Map<AnnotationId, AssetInstance[]> | undefined> {
    const fetchedAnnotationAssetMappings = await this.getPointCloudAnnotationAssetsForModel(
      modelId,
      revisionId
    );

    const matchedAnnotations = Array.from(fetchedAnnotationAssetMappings.entries()).filter(
      ([, assets]) => assets.some((asset) => isSameAssetReference(asset, assetId))
    );
    return matchedAnnotations.length > 0 ? new Map(matchedAnnotations) : undefined;
  }
}
