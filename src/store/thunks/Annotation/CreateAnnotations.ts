import { createAsyncThunk, unwrapResult } from '@reduxjs/toolkit';
import { ThunkConfig } from 'src/store/rootReducer';
import { SaveAnnotations } from 'src/store/thunks/Annotation/SaveAnnotations';
import {
  AnnotationStatus,
  AnnotationUtils,
  VisionAnnotation,
} from 'src/utils/AnnotationUtils';
import { VisionDetectionModelType } from 'src/api/vision/detectionModels/types';
import { UnsavedAnnotation } from 'src/api/annotation/types';
import { getUnsavedAnnotation } from 'src/api/annotation/utils';

export const CreateAnnotations = createAsyncThunk<
  VisionAnnotation[],
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

    return AnnotationUtils.convertToVisionAnnotations(savedAnnotations);
  }

  return [];
});
