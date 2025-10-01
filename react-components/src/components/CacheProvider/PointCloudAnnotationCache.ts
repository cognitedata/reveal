import {
  type ModelRevisionKey,
  type ModelId,
  type RevisionId,
  type PointCloudAnnotationModel,
  type AnnotationId
} from './types';
import { type CogniteClient, type AnnotationFilterProps, type IdEither } from '@cognite/sdk';
import { getInstanceReferenceFromPointCloudAnnotation } from './utils';
import { fetchPointCloudAnnotationAssets } from './annotationModelUtils';
import assert from 'assert';
import { createModelRevisionKey } from './idAndKeyTranslation';
import { type AssetInstance, isClassicAsset } from '../../utilities/instances';
import { type DmsUniqueIdentifier } from '../../data-providers';
import { isDmsInstance, isExternalId, isIdEither, isInternalId } from '../../utilities/instanceIds';

export class PointCloudAnnotationCache {
  private readonly _sdk: CogniteClient;
  private readonly _modelToAnnotationAssetMappings = new Map<
    ModelRevisionKey,
    Promise<Map<AnnotationId, AssetInstance>>
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
  ): Promise<Map<AnnotationId, AssetInstance>> {
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
  ): Promise<Map<AnnotationId, AssetInstance>> {
    const annotationModels = await this.fetchAnnotationForModel(modelId);
    const annotationAssets = fetchPointCloudAnnotationAssets(annotationModels, this._sdk);

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
      return getInstanceReferenceFromPointCloudAnnotation(annotation) !== undefined;
    });
    return filteredAnnotationModelsByAsset as PointCloudAnnotationModel[];
  }

  public async matchPointCloudAnnotationsForModel(
    modelId: ModelId,
    revisionId: RevisionId,
    assetId: IdEither | DmsUniqueIdentifier
  ): Promise<Map<AnnotationId, AssetInstance> | undefined> {
    const fetchedAnnotationAssetMappings = await this.getPointCloudAnnotationAssetsForModel(
      modelId,
      revisionId
    );

    const classicAssetId = isIdEither(assetId) ? assetId : undefined;
    const internalClassicId = isInternalId(classicAssetId) ? classicAssetId.id : undefined;
    const externalClassicId = isExternalId(classicAssetId) ? classicAssetId.externalId : undefined;
    const dmsId = isDmsInstance(assetId) ? assetId : undefined;

    const matchedAnnotations = Array.from(fetchedAnnotationAssetMappings.entries()).filter(
      ([, asset]) => {
        if (isClassicAsset(asset)) {
          return internalClassicId !== undefined
            ? asset.id === internalClassicId
            : asset.externalId === externalClassicId;
        } else {
          return asset.externalId === dmsId?.externalId && asset.space === dmsId?.space;
        }
      }
    );
    return matchedAnnotations.length > 0 ? new Map(matchedAnnotations) : undefined;
  }
}
