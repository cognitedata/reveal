import { createAsyncThunk } from '@reduxjs/toolkit';
import {
  AnnotationJob,
  DetectionModelParams,
  VisionAPIType,
} from 'src/api/types';
import { ThunkConfig } from 'src/store/rootReducer';
import { createAnnotationJob } from 'src/api/annotationJob';
import { State } from 'src/modules/Process/processSlice';
import { PollJobs } from 'src/store/thunks/Process/PollJobs';

export const postAnnotationJob = createAsyncThunk<
  AnnotationJob,
  { modelType: VisionAPIType; fileIds: number[] },
  ThunkConfig
>(
  'postAnnotationJob',
  async ({ modelType, fileIds }, { dispatch, getState }) => {
    const params = getDetectionModelParameters(
      getState().processSlice,
      modelType
    );
    const createdJob = await createAnnotationJob(modelType, fileIds, params);

    dispatch(PollJobs([{ ...createdJob, fileIds }])).unwrap();

    return createdJob;
  }
);

const getDetectionModelParameters = (
  state: State,
  modelType: VisionAPIType
): DetectionModelParams | undefined => {
  return state.availableDetectionModels.find((item) => item.type === modelType)
    ?.settings;
};
