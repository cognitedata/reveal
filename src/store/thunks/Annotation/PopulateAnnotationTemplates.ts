import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  LegacyAnnotationCollection,
  KeypointCollection,
  LegacyShape,
} from 'src/modules/Review/types';
import { ThunkConfig } from 'src/store/rootReducer';
import { AnnotationApiV1 } from 'src/api/annotation/AnnotationApiV1';
import { AnnotationUtilsV1 } from 'src/utils/AnnotationUtilsV1/AnnotationUtilsV1';
import { VisionDetectionModelType } from 'src/api/vision/detectionModels/types';

export const PopulateAnnotationTemplates = createAsyncThunk<
  LegacyAnnotationCollection,
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
  const templateAnnotations = await AnnotationApiV1.list(annotationListRequest);
  const keypointCollections: KeypointCollection[] = [];
  const shapes: LegacyShape[] = [];

  if (templateAnnotations.length) {
    // eslint-disable-next-line no-restricted-syntax
    for (const templateAnnotation of templateAnnotations) {
      if (templateAnnotation.data?.keypoint) {
        keypointCollections.push({
          id: templateAnnotation.id,
          lastUpdated: templateAnnotation.lastUpdatedTime,
          keypoints: templateAnnotation.data.keypoints,
          collectionName: templateAnnotation.text,
        });
      } else {
        shapes.push({
          id: templateAnnotation.id,
          lastUpdated: templateAnnotation.lastUpdatedTime,
          color: AnnotationUtilsV1.getAnnotationColor(
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
    predefinedKeypoints: keypointCollections,
    predefinedShapes: shapes,
  };
});
