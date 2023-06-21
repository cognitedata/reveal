import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  VisionJob,
  DetectionModelParams,
  VisionDetectionModelType,
  ParamsCustomModel,
} from 'src/api/vision/detectionModels/types';
import { ThunkConfig } from 'src/store/rootReducer';
import { postVisionJob } from 'src/api/vision/detectionModels/visionJob';
import { PollJobs } from 'src/store/thunks/Process/PollJobs';
import { ProcessState } from 'src/modules/Process/store/types';

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

  // HACK: remove internal parameters used in the app
  if (modelType === VisionDetectionModelType.CustomModel) {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    return (({ isValid, modelName, ..._ }) => _)(settings as ParamsCustomModel);
  }
  return settings;
};
