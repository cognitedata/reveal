/*!
 * Copyright 2024 Cognite AS
 */

import { type ModelRevisionKey, type ModelId, type RevisionId } from './types';
import { type AnnotationFilterProps, type CogniteClient } from '@cognite/sdk';
import { modelRevisionToKey } from './utils';

export class PointCloudAnnotationCache {
  private readonly _sdk: CogniteClient;
  private readonly _modelToAnnotationMappings = new Map<ModelRevisionKey, Promise<number[]>>();

  constructor(sdk: CogniteClient) {
    this._sdk = sdk;
  }

  public async getPointCloudAnnotationsForModel(
    modelId: ModelId,
    revisionId: RevisionId
  ): Promise<number[]> {
    const key = modelRevisionToKey(modelId, revisionId);
    const cachedResult = this._modelToAnnotationMappings.get(key);

    if (cachedResult !== undefined) {
      return await cachedResult;
    }

    return await this.fetchAndCacheMappingsForModel(modelId, revisionId);
  }

  private async fetchAndCacheMappingsForModel(
    modelId: ModelId,
    revisionId: RevisionId
  ): Promise<number[]> {
    const key = modelRevisionToKey(modelId, revisionId);
    const annotationMappings = this.fetchAnnotationMappingsForModel(modelId);

    this._modelToAnnotationMappings.set(key, annotationMappings);
    return await annotationMappings;
  }

  private async fetchAnnotationMappingsForModel(modelId: ModelId): Promise<number[]> {
    const filter: AnnotationFilterProps = {
      annotatedResourceIds: [{ id: modelId }],
      annotatedResourceType: 'threedmodel',
      annotationType: 'pointcloud.BoundingVolume'
    };
    const annotations = await this._sdk.annotations
      .list({
        filter,
        limit: 1000
      })
      .autoPagingToArray({ limit: Infinity });
    const annotationIds = annotations.map((annotation) => annotation.id);

    return annotationIds;
  }

  public async matchPointCloudAnnotationsForModel(
    modelId: ModelId,
    revisionId: RevisionId,
    annotationId: number
  ): Promise<number[]> {
    const fetchedAnnotationIds = await this.getPointCloudAnnotationsForModel(modelId, revisionId);
    const filteredAnnotationIds = fetchedAnnotationIds.filter((fetchedAnnotationId) => {
      const isAssetIdInMapping = annotationId === fetchedAnnotationId;
      return isAssetIdInMapping;
    });
    return filteredAnnotationIds;
  }
}
