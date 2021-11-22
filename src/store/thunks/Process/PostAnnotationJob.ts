import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  AnnotationJob,
  DetectionModelParams,
  VisionAPIType,
} from 'src/api/types';
import { ThunkConfig } from 'src/store/rootReducer';
import { createAnnotationJob } from 'src/api/annotationJob';
import { State } from 'src/modules/Process/processSlice';
import { PollJobs } from './PollJobs';

export const postAnnotationJob = createAsyncThunk<
  AnnotationJob,
  { modelType: VisionAPIType; fileIds: number[] },
  ThunkConfig
>(
  'process/postAnnotationJobs',
  async ({ modelType, fileIds }, { dispatch, getState }) => {
    const params = getDetectionModelParameters(
      getState().processSlice,
      modelType
    );
    const createdJob = await createAnnotationJob(modelType, fileIds, params);

    dispatch(
      PollJobs({ job: createdJob, filteredBatchFileIds: fileIds, modelType })
    );

    return createdJob;
  }
);

const getDetectionModelParameters = (
  state: State,
  modelType: VisionAPIType
): DetectionModelParams | undefined => {
  switch (modelType) {
    case VisionAPIType.OCR: {
      return state.detectionModelParameters.ocr;
    }
    case VisionAPIType.TagDetection: {
      return state.detectionModelParameters.tagDetection;
    }
    case VisionAPIType.ObjectDetection: {
      return state.detectionModelParameters.objectDetection;
    }
    default: {
      return undefined;
    }
  }
};
