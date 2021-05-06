import { combineReducers } from '@reduxjs/toolkit';
import './commonActions';
import processSlice from 'src/modules/Process/processSlice';
import previewSlice from 'src/modules/Preview/previewSlice';
import uploadedFiles from 'src/modules/Upload/uploadedFilesSlice';
import fileDetailsSlice from 'src/modules/FileDetails/fileDetailsSlice';
import annotationReducer from 'src/modules/Common/annotationSlice';

const rootReducer = combineReducers({
  uploadedFiles,
  processSlice,
  previewSlice,
  fileDetailsSlice,
  annotationReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export type ThunkConfig = { state: RootState };

export default rootReducer;
