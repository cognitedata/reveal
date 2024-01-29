/*!
 * Copyright 2024 Cognite AS
 */

import {
  type PointCloudObjectMetadata,
  type PointCloudObjectCollection,
  type CognitePointCloudModel,
  AnnotationIdPointCloudObjectCollection
} from '@cognite/reveal';
import { useReveal } from '../RevealContainer/RevealContext';

export class PointCloudObjectCollectionCache {
  private readonly _modelToObjectCollecction = new Map<string, PointCloudObjectCollection>();

  public getPointCloudObjectCollection(): Array<{
    metadata: PointCloudObjectMetadata;
    objectCollecction: AnnotationIdPointCloudObjectCollection;
  }> {
    const reveal = useReveal();
    if (reveal === undefined) {
      return [];
    }
    const pointCloudModels = reveal.models.filter(
      (model) => model.type === 'pointcloud'
    ) as CognitePointCloudModel[];
    const pointCloudObjectCollection: Array<{
      metadata: PointCloudObjectMetadata;
      objectCollecction: AnnotationIdPointCloudObjectCollection;
    }> = [];

    const pointCloudMappings = pointCloudModels.flatMap((pointCloudModel) => {
      pointCloudModel.traverseStylableObjects((pointCloudObject) => {
        const stylableObject = new AnnotationIdPointCloudObjectCollection([
          pointCloudObject.annotationId
        ]);
        pointCloudObjectCollection.push({
          metadata: pointCloudObject,
          objectCollecction: stylableObject
        });
      });
      return pointCloudObjectCollection;
    });
    return pointCloudMappings;
  }

  // public async getPointCloudObjectCollection(modelId: ModelId, revisionId: RevisionId) {
  //   const key = modelRevisionToKey(modelId, revisionId);
  //   const cached = this._modelToObjectCollecction.get(key);
  //   if (cached !== undefined) {
  //     return cached;
  //   }
  //   const collection = new PointCloudObjectCollection();
  //   this._modelToObjectCollecction.set(key, collection);
  //   return collection;
  // }
}
