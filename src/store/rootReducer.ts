import { combineReducers } from '@reduxjs/toolkit';
import './commonActions';
import processSlice from 'src/modules/Process/processSlice';
import previewSlice from 'src/modules/Preview/previewSlice';
import uploadedFiles from 'src/modules/Upload/uploadedFilesSlice';
import fileDetailsSlice from 'src/modules/FileDetails/fileDetailsSlice';

const rootReducer = combineReducers({
  uploadedFiles,
  processSlice,
  previewSlice,
  fileMetadataSlice: fileDetailsSlice,
});

export type RootState = ReturnType<typeof rootReducer>;
export type ThunkConfig = { state: RootState };

export default rootReducer;
