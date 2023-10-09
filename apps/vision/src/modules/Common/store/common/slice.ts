import {
  createSlice,
  isFulfilled,
  isRejected,
  PayloadAction,
} from '@reduxjs/toolkit';

import { DeleteAnnotations } from '../../../../store/thunks/Annotation/DeleteAnnotations';
import { RetrieveAnnotations } from '../../../../store/thunks/Annotation/RetrieveAnnotations';
import { SaveAnnotations } from '../../../../store/thunks/Annotation/SaveAnnotations';
import { SaveAnnotationTemplates } from '../../../../store/thunks/Annotation/SaveAnnotationTemplates';
import { UpdateAnnotations } from '../../../../store/thunks/Annotation/UpdateAnnotations';
import { UpdateFiles } from '../../../../store/thunks/Files/UpdateFiles';
import { CreateVisionJob } from '../../../../store/thunks/Process/CreateVisionJob';
import { PollJobs } from '../../../../store/thunks/Process/PollJobs';
import { extractErrorMessage } from '../../../../utils/extractErrorMessage';
import { ToastUtils } from '../../../../utils/ToastUtils';
import { CDFStatusModes } from '../../Components/CDFStatus/CDFStatus';

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
        SaveAnnotations,
        DeleteAnnotations,
        UpdateAnnotations,
        UpdateFiles
      ),
      (state) => {
        state.saveState.mode = 'timestamp';
        state.saveState.time = new Date().getTime();
      }
    );

    builder.addMatcher(
      isRejected(
        SaveAnnotations,
        RetrieveAnnotations,
        DeleteAnnotations,
        UpdateAnnotations,
        SaveAnnotationTemplates
      ),
      (state, { error }) => {
        if (error && error.message) {
          state.saveState.mode = 'error';
          state.saveState.time = new Date().getTime();
          const errorMessage = extractErrorMessage(error);

          ToastUtils.onFailure(`Failed to update Annotations, ${errorMessage}`);
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
