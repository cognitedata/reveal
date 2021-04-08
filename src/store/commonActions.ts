import { createAction } from '@reduxjs/toolkit';
import { AnnotationJob, DetectionModelType } from 'src/api/types';
import { VisionAnnotation } from 'src/utils/AnnotationUtils';

export const fileProcessUpdate = createAction<{
  fileIds: number[];
  job: AnnotationJob;
  modelType: DetectionModelType;
}>('fileProcessUpdate');

export const addAnnotations = createAction<VisionAnnotation[]>(
  'addAnnotations'
);

export const deleteAnnotationsFromState = createAction<string[]>(
  'deleteAnnotations'
);
