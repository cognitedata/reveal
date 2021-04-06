import { createAction } from '@reduxjs/toolkit';
import { AnnotationJob } from 'src/api/types';
import { VisionAnnotation } from 'src/utils/AnnotationUtils';

export const fileProcessUpdate = createAction<{
  fileId: number;
  job: AnnotationJob;
}>('fileProcessUpdate');

export const addAnnotations = createAction<VisionAnnotation[]>(
  'addAnnotations'
);

export const deleteAnnotationsFromState = createAction<string[]>(
  'deleteAnnotations'
);
