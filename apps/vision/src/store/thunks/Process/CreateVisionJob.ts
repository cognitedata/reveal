import { createAsyncThunk } from '@reduxjs/toolkit';

import {
  VisionJob,
  DetectionModelParams,
  VisionDetectionModelType,
} from '../../../api/vision/detectionModels/types';
import { postVisionJob } from '../../../api/vision/detectionModels/visionJob';
import { ProcessState } from '../../../modules/Process/store/types';
import { ThunkConfig } from '../../rootReducer';

import { PollJobs } from './PollJobs';

export const CreateVisionJob = createAsyncThunk<
  VisionJob,
  { modelType: VisionDetectionModelType; fileIds: number[] },
  ThunkConfig
>('CreateVisionJob', async ({ modelType, fileIds }, { dispatch, getState }) => {
  const params = getDetectionModelParameters(
    getState().processSlice,
    modelType
  );
  const createdJob = await postVisionJob(modelType, fileIds, params);

  dispatch(PollJobs([{ ...createdJob, fileIds }])).unwrap();

  return createdJob;
});

const getDetectionModelParameters = (
  state: ProcessState,
  modelType: VisionDetectionModelType
): DetectionModelParams | undefined => {
  const settings = state.availableDetectionModels.find(
    (item) => item.type === modelType
  )?.settings;

  return settings;
};
