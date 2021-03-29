import { createAction } from '@reduxjs/toolkit';
import { AnnotationJob, DetectionModelType } from 'src/api/types';
import { AnnotationStatus, VisionAnnotation } from 'src/utils/AnnotationUtils';

export const fileProcessUpdate = createAction<{
  fileId: string | number;
  job: AnnotationJob;
}>('fileProcessUpdate');

export const addAnnotations = createAction<{
  fileId: string;
  type: DetectionModelType;
  annotations: VisionAnnotation[];
  status: AnnotationStatus;
}>('addAnnotations');

export const deleteAnnotations = createAction<string[]>('deleteAnnotations');
