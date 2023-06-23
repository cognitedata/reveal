import {
  CDFAnnotationTypeEnum,
  ImageKeypointCollection,
  Status,
} from '@vision/api/annotation/types';
import { UnsavedVisionAnnotation } from '@vision/modules/Common/types';
import {
  TempKeypointCollection,
  VisionReviewAnnotation,
} from '@vision/modules/Review/types';
import isFinite from 'lodash/isFinite';

/**
 * Returns UnsavedVisionImageKeypointCollection with confidence set to 1 for annotation itself and each keypoint,
 * Status is set to Approved
 * @param collection
 */
export const convertTempKeypointCollectionToUnsavedVisionImageKeypointCollection =
  (
    collection: TempKeypointCollection | null
  ): UnsavedVisionAnnotation<ImageKeypointCollection> | null => {
    if (
      !collection ||
      !collection.annotatedResourceId ||
      !isFinite(collection.annotatedResourceId) ||
      !collection.data ||
      !collection.data.label ||
      !collection.data.keypoints ||
      !Object.keys(collection.data.keypoints).length
    ) {
      return null;
    }
    return {
      annotationType: CDFAnnotationTypeEnum.ImagesKeypointCollection,
      status: Status.Approved, // since all manually created annotation are considered "approved" by default
      annotatedResourceId: collection.annotatedResourceId,
      data: {
        ...collection.data,
        confidence: 1, // since it is manually created
        keypoints: Object.fromEntries(
          Object.entries(collection.data.keypoints).map(
            ([label, reviewKeypoint]) => [
              label,
              {
                point: reviewKeypoint.keypoint.point,
                confidence: 1, // since it is manually created
              },
            ]
          )
        ),
      },
    };
  };
// todo: add test cases [VIS-877]
export const convertTempKeypointCollectionToVisionReviewImageKeypointCollection =
  (
    tempKeypointCollection: TempKeypointCollection | null
  ): VisionReviewAnnotation<ImageKeypointCollection> | null => {
    if (!tempKeypointCollection) {
      return null;
    }

    const {
      id,
      annotatedResourceId,
      data: { keypoints, label } = {},
      color,
    } = tempKeypointCollection;
    return {
      annotation: {
        id,
        annotatedResourceId,
        label,
        keypoints,
        createdTime: 0,
        lastUpdatedTime: 0,
        status: Status.Approved,
        annotationType: CDFAnnotationTypeEnum.ImagesKeypointCollection,
      },
      selected: true,
      show: true,
      color,
    } as VisionReviewAnnotation<ImageKeypointCollection>;
  };
