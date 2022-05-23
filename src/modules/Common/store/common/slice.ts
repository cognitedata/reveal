import {
  createSlice,
  isFulfilled,
  isRejected,
  PayloadAction,
} from '@reduxjs/toolkit';
import { CDFStatusModes } from 'src/modules/Common/Components/CDFStatus/CDFStatus';
import { DeleteAnnotationsV1 } from 'src/store/thunks/Annotation/DeleteAnnotationsV1';
import { RetrieveAnnotationsV1 } from 'src/store/thunks/Annotation/RetrieveAnnotationsV1';
import { SaveAnnotationsV1 } from 'src/store/thunks/Annotation/SaveAnnotationsV1';
import { SaveAnnotationTemplates } from 'src/store/thunks/Annotation/SaveAnnotationTemplates';
import { UpdateAnnotationsV1 } from 'src/store/thunks/Annotation/UpdateAnnotationsV1';
import { UpdateFiles } from 'src/store/thunks/Files/UpdateFiles';
import { ToastUtils } from 'src/utils/ToastUtils';
import { PollJobs } from 'src/store/thunks/Process/PollJobs';
import { CreateVisionJob } from 'src/store/thunks/Process/CreateVisionJob';
import { BulkEditUnsavedState, CommonState } from './types';

export const initialState: CommonState = {
  showFileDownloadModal: false,
  showBulkEditModal: false,
  showModelTrainingModal: false,
  bulkEditUnsavedState: {},
  saveState: {
    mode: 'saved' as CDFStatusModes,
    time: new Date().getTime(),
  },
};

const commonSlice = createSlice({
  name: 'commonSlice',
  initialState,
  /* eslint-disable no-param-reassign */
  reducers: {
    setFileDownloadModalVisibility(state, action: PayloadAction<boolean>) {
      state.showFileDownloadModal = action.payload;
    },
    setBulkEditModalVisibility(state, action: PayloadAction<boolean>) {
      state.showBulkEditModal = action.payload;
    },
    setModelTrainingModalVisibility(state, action: PayloadAction<boolean>) {
      state.showModelTrainingModal = action.payload;
    },
    setBulkEditUnsaved(state, action: PayloadAction<BulkEditUnsavedState>) {
      state.bulkEditUnsavedState = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder.addMatcher(
      isFulfilled(
        SaveAnnotationsV1,
        DeleteAnnotationsV1,
        UpdateAnnotationsV1,
        UpdateFiles
      ),
      (state) => {
        state.saveState.mode = 'timestamp';
        state.saveState.time = new Date().getTime();
      }
    );

    builder.addMatcher(
      isRejected(
        SaveAnnotationsV1,
        RetrieveAnnotationsV1,
        DeleteAnnotationsV1,
        UpdateAnnotationsV1,
        SaveAnnotationTemplates
      ),
      (state, { error }) => {
        if (error && error.message) {
          state.saveState.mode = 'error';
          state.saveState.time = new Date().getTime();
          ToastUtils.onFailure(
            `Failed to update Annotations, ${error?.message}`
          );
        }
      }
    );
    builder.addMatcher(isRejected(UpdateFiles), (state, { error }) => {
      if (error && error.message) {
        state.saveState.mode = 'error';
        state.saveState.time = new Date().getTime();
        ToastUtils.onFailure(`Failed to update files, ${error?.message}`);
      }
    });
    builder.addMatcher(
      isRejected(PollJobs, CreateVisionJob),
      (state, { error }) => {
        if (error && error.message) {
          state.saveState.mode = 'error';
          state.saveState.time = new Date().getTime();
          ToastUtils.onFailure(
            `Failed to update some detection jobs, ${error?.message}`
          );
        }
      }
    );
  },
});

export const {
  setFileDownloadModalVisibility,
  setBulkEditModalVisibility,
  setModelTrainingModalVisibility,
  setBulkEditUnsaved,
} = commonSlice.actions;

export default commonSlice.reducer;
