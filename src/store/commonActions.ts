import { createAction } from '@reduxjs/toolkit';
import {
  VisionJob,
  VisionDetectionModelType,
} from 'src/api/vision/detectionModels/types';

export const fileProcessUpdate =
  createAction<{
    fileIds: number[];
    job: VisionJob;
    modelType: VisionDetectionModelType;
    completedFileIds: number[];
    failedFileIds: number[];
  }>('fileProcessUpdate');

export const clearFileState = createAction<number[]>('clearFileState');

export const clearExplorerFileState = createAction<number[]>(
  'clearExplorerFileState'
);

export const clearAnnotationState = createAction<number[]>(
  'clearAnnotationState'
);

export const deselectAllSelectionsReviewPage = createAction<void>(
  'deselectAllSelectionsReviewPage'
);
