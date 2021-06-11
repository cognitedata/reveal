import { createAction } from '@reduxjs/toolkit';
import { AnnotationJob, VisionAPIType } from 'src/api/types';
import { VisionAnnotation } from 'src/utils/AnnotationUtils';
import { SelectFilter } from 'src/modules/Common/types';

export const fileProcessUpdate =
  createAction<{
    fileIds: number[];
    job: AnnotationJob;
    modelType: VisionAPIType;
  }>('fileProcessUpdate');

export const addAnnotations =
  createAction<VisionAnnotation[]>('addAnnotations');

export const deleteAnnotationsFromState =
  createAction<number[]>('deleteAnnotations');

export const setSelectedAllFiles = createAction<{
  selectStatus: boolean;
  filter?: SelectFilter;
}>('setSelectedAllFiles');
