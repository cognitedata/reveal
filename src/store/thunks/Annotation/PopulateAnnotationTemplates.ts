import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  PredefinedVisionAnnotations,
  PredefinedKeypointCollection,
  PredefinedShape,
} from 'src/modules/Review/types';
import { ThunkConfig } from 'src/store/rootReducer';
import { LegacyAnnotationApi } from 'src/api/annotation/legacy/legacyAnnotationApi';
import { VisionDetectionModelType } from 'src/api/vision/detectionModels/types';
import { getPredefinedKeypointsWithColor } from 'src/store/util/getPredefinedKeypointsWithCorrectColors';
import { LegacyAnnotationUtils } from 'src/api/annotation/legacy/legacyAnnotationUtils';

export const PopulateAnnotationTemplates = createAsyncThunk<
  PredefinedVisionAnnotations,
  void,
  ThunkConfig
>('PopulateAnnotationTemplates', async () => {
  const filterPayload: any = {
    source: 'user',
    annotationType: 'CDF_ANNOTATION_TEMPLATE',
    annotatedResourceType: 'file',
  };
  const annotationListRequest = {
    filter: filterPayload,
    limit: -1,
  };
  const templateAnnotations = await LegacyAnnotationApi.list(
    annotationListRequest
  );
  const keypointCollections: PredefinedKeypointCollection[] = [];
  const shapes: PredefinedShape[] = [];

  if (templateAnnotations.length) {
    // eslint-disable-next-line no-restricted-syntax
    for (const templateAnnotation of templateAnnotations) {
      if (templateAnnotation.data?.keypoint) {
        keypointCollections.push({
          id: templateAnnotation.id,
          lastUpdated: templateAnnotation.lastUpdatedTime,
          keypoints: getPredefinedKeypointsWithColor(
            templateAnnotation.data.keypoints,
            templateAnnotation.data.color
          ),
          collectionName: templateAnnotation.text,
          // Predefined collections created after june 2022 have color
          // property, but old collections have color on individual keypoints
          // This ensures backward comparability by using color from the first keypoint
          // if collection does not have a color field.
          color:
            templateAnnotation.data.color ||
            (templateAnnotation.data.keypoints?.length
              ? templateAnnotation.data.keypoints[0].color
              : ''),
        });
      } else {
        shapes.push({
          id: templateAnnotation.id,
          lastUpdated: templateAnnotation.lastUpdatedTime,
          color: LegacyAnnotationUtils.getAnnotationColor(
            templateAnnotation.text,
            VisionDetectionModelType.ObjectDetection,
            templateAnnotation.data
          ),
          shapeName: templateAnnotation.text,
        });
      }
    }
  }
  return {
    predefinedKeypointCollections: keypointCollections,
    predefinedShapes: shapes,
  };
});
