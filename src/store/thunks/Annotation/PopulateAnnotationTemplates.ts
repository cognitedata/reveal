import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  PredefinedVisionAnnotations,
  PredefinedKeypointCollection,
  PredefinedShape,
} from 'src/modules/Review/types';
import { ThunkConfig } from 'src/store/rootReducer';
import { LegacyAnnotationApi } from 'src/api/annotation/legacy/legacyAnnotationApi';
import { getPredefinedKeypointsWithColor } from 'src/store/util/getPredefinedKeypointsWithCorrectColors';
import { getPredefinedAnnotationColor } from 'src/utils/colorUtils';

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
          color: getPredefinedAnnotationColor(templateAnnotation),
        });
      } else {
        shapes.push({
          id: templateAnnotation.id,
          lastUpdated: templateAnnotation.lastUpdatedTime,
          color: getPredefinedAnnotationColor(templateAnnotation),
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
