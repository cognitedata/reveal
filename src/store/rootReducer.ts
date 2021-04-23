import { combineReducers } from '@reduxjs/toolkit';
import './commonActions';
import processSlice from 'src/modules/Process/processSlice';
import previewSlice from 'src/modules/Preview/previewSlice';
import uploadedFiles from 'src/modules/Upload/uploadedFilesSlice';
import fileMetadataSlice from 'src/modules/FileMetaData/fileMetadataSlice';

const rootReducer = combineReducers({
  uploadedFiles,
  processSlice,
  previewSlice,
  fileMetadataSlice,
});

export type RootState = ReturnType<typeof rootReducer>;
export type ThunkConfig = { state: RootState };

export default rootReducer;
