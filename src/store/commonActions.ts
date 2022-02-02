import { createAction } from '@reduxjs/toolkit';
import { AnnotationJob, VisionAPIType } from 'src/api/types';

export const fileProcessUpdate =
  createAction<{
    fileIds: number[];
    job: AnnotationJob;
    modelType: VisionAPIType;
    completedFileIds: number[];
    failedFileIds: number[];
  }>('fileProcessUpdate');

export const clearFileState = createAction<number[]>('clearFileState');

export const clearExplorerFileState = createAction<number[]>(
  'clearExplorerFileState'
);

export const deselectAllSelectionsReviewPage = createAction<void>(
  'deselectAllSelectionsReviewPage'
);
