/*!
 * Copyright 2024 Cognite AS
 */

import {
  type PointCloudObjectMetadata,
  type CognitePointCloudModel,
  AnnotationIdPointCloudObjectCollection,
  type Cognite3DViewer
} from '@cognite/reveal';
import { type ModelId, type RevisionId } from './types';
import { useReveal } from '../RevealContainer/RevealContext';

export class PointCloudObjectCollectionCache {
  private readonly _reveal: Cognite3DViewer;

  constructor(reveal: Cognite3DViewer | undefined) {
    this._reveal = reveal ?? useReveal();
  }

  public getPointCloudObjectCollection(
    modelId: ModelId,
    revisionId: RevisionId
  ): Array<{
    metadata: PointCloudObjectMetadata;
    objectCollection: AnnotationIdPointCloudObjectCollection;
  }> {
    if (this._reveal === null) {
      return [];
    }
    const pointCloudModels = this._reveal.models.filter(
      (model) => model.modelId === modelId && model.revisionId === revisionId
    ) as CognitePointCloudModel[];
    const pointCloudObjectCollection: Array<{
      metadata: PointCloudObjectMetadata;
      objectCollection: AnnotationIdPointCloudObjectCollection;
    }> = [];

    const pointCloudMappings = pointCloudModels.flatMap((pointCloudModel) => {
      pointCloudModel.traverseStylableObjects((pointCloudObject) => {
        const stylableObject = new AnnotationIdPointCloudObjectCollection([
          pointCloudObject.annotationId
        ]);
        pointCloudObjectCollection.push({
          metadata: pointCloudObject,
          objectCollection: stylableObject
        });
      });
      return pointCloudObjectCollection;
    });
    return pointCloudMappings;
  }

  public getPointCloudObjectCollectionForAssets(
    modelId: ModelId,
    revisionId: RevisionId,
    annotationId: number
  ): Array<{
    metadata: PointCloudObjectMetadata;
    objectCollection: AnnotationIdPointCloudObjectCollection;
  }> {
    const pointCloudMappings = this.getPointCloudObjectCollection(modelId, revisionId);
    const filteredMappings = pointCloudMappings.filter((mapping) => {
      const isAssetIdInMapping = annotationId === mapping.metadata.annotationId;
      return isAssetIdInMapping;
    });
    return filteredMappings;
  }
}
