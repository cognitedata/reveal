import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  AnnotationCollection,
  KeypointCollection,
  Shape,
} from 'src/modules/Review/types';
import { ThunkConfig } from 'src/store/rootReducer';
import { AnnotationApi } from 'src/api/annotation/AnnotationApi';
import { AnnotationUtils } from 'src/utils/AnnotationUtils';
import { VisionDetectionModelType } from 'src/api/vision/detectionModels/types';

export const PopulateAnnotationTemplates = createAsyncThunk<
  AnnotationCollection,
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
  const templateAnnotations = await AnnotationApi.list(annotationListRequest);
  const keypointCollections: KeypointCollection[] = [];
  const shapes: Shape[] = [];

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
          color: AnnotationUtils.getAnnotationColor(
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
