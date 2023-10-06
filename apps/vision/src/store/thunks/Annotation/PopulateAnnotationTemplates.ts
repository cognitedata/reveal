import { createAsyncThunk } from '@reduxjs/toolkit';

import { LegacyAnnotationApi } from '../../../api/annotation/legacy/legacyAnnotationApi';
import {
  PredefinedVisionAnnotations,
  PredefinedKeypointCollection,
  PredefinedShape,
} from '../../../modules/Review/types';
import { getPredefinedAnnotationColor } from '../../../utils/colorUtils';
import { ThunkConfig } from '../../rootReducer';
import { getPredefinedKeypointsWithColor } from '../../util/getPredefinedKeypointsWithCorrectColors';

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
