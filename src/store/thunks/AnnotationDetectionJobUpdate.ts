import { createAsyncThunk, unwrapResult } from '@reduxjs/toolkit';
import { ThunkConfig } from 'src/store/rootReducer';
import { AnnotationJob } from 'src/api/types';
import { SaveAnnotations } from 'src/store/thunks/SaveAnnotations';
import { getUnsavedAnnotation } from 'src/api/utils';
import { UnsavedAnnotation } from 'src/api/annotation/types';
import { AnnotationUtils, VisionAnnotation } from 'src/utils/AnnotationUtils';

export const AnnotationDetectionJobUpdate = createAsyncThunk<
  VisionAnnotation[],
  AnnotationJob,
  ThunkConfig
>('AnnotationDetectionJobUpdate', async (job: AnnotationJob, { dispatch }) => {
  if (job.status === 'Completed') {
    let unsavedAnnotations: UnsavedAnnotation[] = [];
    job.items.forEach((annResult) => {
      const { annotations } = annResult;

      if (annotations && annotations.length) {
        const unsavedAnnotationsForFile = annotations.map((ann) =>
          getUnsavedAnnotation(ann.text, ann.region, job.type, annResult.fileId)
        );
        unsavedAnnotations = unsavedAnnotations.concat(
          unsavedAnnotationsForFile
        );
      }
    });

    if (unsavedAnnotations.length) {
      const savedAnnotationResponse = await dispatch(
        SaveAnnotations(unsavedAnnotations)
      );
      const savedAnnotations = unwrapResult(savedAnnotationResponse);
      return AnnotationUtils.convertToVisionAnnotations(savedAnnotations);
    }
  }
  return [];
});
