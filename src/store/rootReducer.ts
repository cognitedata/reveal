import { combineReducers } from '@reduxjs/toolkit';
import processSlice from 'src/store/processSlice';
import previewSlice from 'src/store/previewSlice';
import uploadedFiles from './uploadedFilesSlice';

const rootReducer = combineReducers({
  uploadedFiles,
  processSlice,
  previewSlice,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
