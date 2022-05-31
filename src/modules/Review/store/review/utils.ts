import isFinite from 'lodash-es/isFinite';
import { UnsavedKeypointCollection } from 'src/modules/Review/store/review/types';
import { UnsavedVisionAnnotation } from 'src/modules/Common/types';
import {
  CDFAnnotationTypeEnum,
  ImageKeypointCollection,
  Status,
} from 'src/api/annotation/types';

export const convertUnsavedKeypointCollectionToUnsavedVisionImageKeypointCollection =
  (
    collection: UnsavedKeypointCollection
  ): UnsavedVisionAnnotation<ImageKeypointCollection> | null => {
    if (
      collection.annotatedResourceId === undefined ||
      !isFinite(collection.annotatedResourceId) ||
      !collection.reviewKeypoints ||
      !collection.reviewKeypoints.length ||
      !collection.label
    ) {
      return null;
    }
    return {
      annotationType: CDFAnnotationTypeEnum.ImagesKeypointCollection,
      status: Status.Approved, // since all manually created annotation are considered "approved" by default
      annotatedResourceId: collection.annotatedResourceId,
      data: {
        label: collection.label,
        confidence: 1, // since it is manually created
        keypoints: collection.reviewKeypoints.map((reviewKeypoint) => ({
          label: reviewKeypoint.keypoint.label,
          point: reviewKeypoint.keypoint.point,
          confidence: 1, // since it is manually created
        })),
      },
    };
  };
