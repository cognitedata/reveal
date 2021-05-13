import { createAsyncThunk, unwrapResult } from '@reduxjs/toolkit';
import { ThunkConfig } from 'src/store/rootReducer';
import { AnnotationUtils, VisionAnnotation } from 'src/utils/AnnotationUtils';
import { UpdateAnnotations } from 'src/store/thunks/UpdateAnnotations';

export const UpdateAnnotationsById = createAsyncThunk<
  VisionAnnotation[],
  number[],
  ThunkConfig
>('UpdateAnnotationsById', async (annotationIds, { getState, dispatch }) => {
  const state = getState().previewSlice;
  const annotationState = state.annotations.byId;

  const unsavedAnnotations = annotationIds.map((id) => {
    const ann = annotationState[id];
    return AnnotationUtils.convertToAnnotation(ann);
  });
  const updatedAnnotationsResponse = await dispatch(
    UpdateAnnotations(unsavedAnnotations)
  );
  const updatedAnnotations = unwrapResult(updatedAnnotationsResponse);
  const updatedVisionAnnotations = AnnotationUtils.convertToVisionAnnotations(
    updatedAnnotations
  );
  return updatedVisionAnnotations;
});
