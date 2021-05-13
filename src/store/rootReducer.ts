import { combineReducers } from '@reduxjs/toolkit';
import './commonActions';
import filesSlice from 'src/modules/Common/filesSlice';
import processSlice from 'src/modules/Process/processSlice';
import previewSlice from 'src/modules/Preview/previewSlice';
import fileDetailsSlice from 'src/modules/FileDetails/fileDetailsSlice';
import annotationReducer from 'src/modules/Common/annotationSlice';

const rootReducer = combineReducers({
  filesSlice,
  processSlice,
  previewSlice,
  fileDetailsSlice,
  annotationReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export type ThunkConfig = { state: RootState };

export default rootReducer;
