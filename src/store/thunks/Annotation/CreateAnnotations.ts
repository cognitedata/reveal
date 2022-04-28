import { createAsyncThunk, unwrapResult } from '@reduxjs/toolkit';
import { ThunkConfig } from 'src/store/rootReducer';
import { SaveAnnotations } from 'src/store/thunks/Annotation/SaveAnnotations';
import {
  AnnotationStatus,
  AnnotationUtilsV1,
  VisionAnnotationV1,
} from 'src/utils/AnnotationUtilsV1/AnnotationUtilsV1';
import { VisionDetectionModelType } from 'src/api/vision/detectionModels/types';
import { UnsavedAnnotation } from 'src/api/annotation/types';
import { getUnsavedAnnotation } from 'src/api/annotation/utils';

export const CreateAnnotations = createAsyncThunk<
  VisionAnnotationV1[],
  { fileId: number; annotation: UnsavedAnnotation },
  ThunkConfig
>('CreateAnnotations', async (payload, { dispatch }) => {
  const { fileId, annotation } = payload;
  const unsavedAnnotations: UnsavedAnnotation[] = [
    getUnsavedAnnotation(
      annotation.text,
      VisionDetectionModelType.ObjectDetection,
      fileId,
      'user',
      annotation.region,
      AnnotationStatus.Verified,
      annotation.data
    ),
  ];

  if (unsavedAnnotations.length) {
    const savedAnnotationResponse = await dispatch(
      SaveAnnotations(unsavedAnnotations)
    );
    const savedAnnotations = unwrapResult(savedAnnotationResponse);

    return AnnotationUtilsV1.convertToVisionAnnotationsV1(savedAnnotations);
  }

  return [];
});
