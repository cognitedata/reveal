import { createAsyncThunk, unwrapResult } from '@reduxjs/toolkit';
import { ThunkConfig } from 'src/store/rootReducer';
import {
  AnnotationDrawerMode,
  AnnotationStatus,
  AnnotationUtils,
  VisionAnnotation,
} from 'src/utils/AnnotationUtils';
import { VisionAPIType } from 'src/api/types';
import { resetEditState } from 'src/modules/Preview/previewSlice';
import { SaveAnnotations } from 'src/store/thunks/SaveAnnotations';
import { UnsavedAnnotation } from 'src/api/annotation/types';
import { getRegionFromBox, getUnsavedAnnotation } from 'src/api/utils';

export const CreateAnnotations = createAsyncThunk<
  VisionAnnotation[],
  { fileId: number; type: AnnotationDrawerMode },
  ThunkConfig
>('CreateAnnotations', async (payload, { getState, dispatch }) => {
  const state = getState().previewSlice;
  const editModeAnnotationData = state.drawer;

  let unsavedAnnotations: UnsavedAnnotation[] = [];

  if (payload.type === AnnotationDrawerMode.AddAnnotation) {
    unsavedAnnotations = [
      getUnsavedAnnotation(
        editModeAnnotationData.text,
        VisionAPIType.ObjectDetection,
        payload.fileId,
        getRegionFromBox('rectangle', editModeAnnotationData.box),
        AnnotationStatus.Verified,
        'user'
      ),
    ];
  }

  if (unsavedAnnotations.length) {
    const savedAnnotationResponse = await dispatch(
      SaveAnnotations(unsavedAnnotations)
    );
    const savedAnnotations = unwrapResult(savedAnnotationResponse);

    // clear state
    dispatch(resetEditState);

    return AnnotationUtils.convertToVisionAnnotations(savedAnnotations);
  }

  return [];
});
