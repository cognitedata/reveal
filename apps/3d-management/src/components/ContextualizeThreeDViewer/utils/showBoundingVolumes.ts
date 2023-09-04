import { Color } from 'three';

import {
  AnnotationIdPointCloudObjectCollection,
  CognitePointCloudModel,
} from '@cognite/reveal';

export const showBoundingVolumes = (
  pointCloudModel: CognitePointCloudModel
) => {
  const annotationIds: number[] = [];
  pointCloudModel.traverseStylableObjects((objectMetadata) =>
    annotationIds.push(objectMetadata.annotationId)
  );

  const objectCollection = new AnnotationIdPointCloudObjectCollection(
    annotationIds
  );
  const appearance = { color: new Color(0, 1, 0) };

  pointCloudModel.assignStyledObjectCollection(objectCollection, appearance);
};
