import { combineReducers } from '@reduxjs/toolkit';
import './commonActions';
import filesSlice from 'src/modules/Common/store/filesSlice';
import commonReducer from 'src/modules/Common/store/commonSlice';
import annotationReducer from 'src/modules/Common/store/annotationSlice';
import previewSlice from 'src/modules/Review/store/previewSlice';
import imagePreviewReducer from 'src/modules/Review/store/imagePreviewSlice';
import fileDetailsSlice from 'src/modules/FileDetails/fileDetailsSlice';
import explorerReducer from 'src/modules/Explorer/store/explorerSlice';
import processSlice from 'src/modules/Process/processSlice';

const rootReducer = combineReducers({
  filesSlice,
  commonReducer,
  processSlice,
  previewSlice,
  fileDetailsSlice,
  annotationReducer,
  explorerReducer,
  imagePreviewReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export type ThunkConfig = { state: RootState };

export default rootReducer;
