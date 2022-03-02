import { createAsyncThunk } from '@reduxjs/toolkit';
import { AutoMLTrainingJob } from 'src/api/vision/autoML/types';
import { VisionAPIType } from 'src/api/vision/detectionModels/types';
import {
  addToAvailableDetectionModels,
  BUILT_IN_MODEL_COUNT,
  setCustomModelName,
  setDetectionModelParameters,
  setSelectedDetectionModels,
  setUnsavedDetectionModelSettings,
} from 'src/modules/Process/store/slice';
import { ThunkConfig } from 'src/store/rootReducer';

const DEFAULT_THRESHOLD = 0.8;

export const PopulateCustomModel = createAsyncThunk<
  void,
  AutoMLTrainingJob,
  ThunkConfig
>('PopulateProcessFiles', async (model, { getState, dispatch }) => {
  const availableModels = getState().processSlice.availableDetectionModels;
  if (availableModels.length <= BUILT_IN_MODEL_COUNT) {
    dispatch(addToAvailableDetectionModels());
  }
  const availableModelsUpdated =
    getState().processSlice.availableDetectionModels;

  // Set (currently unsaved) configuration
  const modelIndex = availableModelsUpdated.findIndex(
    (item) => item.type === VisionAPIType.CustomModel
  );
  const newParams = {
    modelIndex,
    params: {
      modelJobId: model.jobId,
      threshold: DEFAULT_THRESHOLD,
    },
  };
  dispatch(setUnsavedDetectionModelSettings(newParams));
  dispatch(
    setCustomModelName({
      modelIndex,
      modelName: `${model.name || 'Untitled model'}`,
    })
  );
  // Save configuration and set model selection
  dispatch(setDetectionModelParameters());
  dispatch(setSelectedDetectionModels([VisionAPIType.CustomModel]));
});
