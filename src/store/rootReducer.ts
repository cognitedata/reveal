import { combineReducers } from '@reduxjs/toolkit';
import './commonActions';
import fileReducer from 'src/modules/Common/store/files/slice';
import commonReducer from 'src/modules/Common/store/common/slice';
import annotationReducer from 'src/modules/Common/store/annotation/slice';
import annotationLabelReducer from 'src/modules/Review/store/annotationLabelSlice';
import fileDetailsSlice from 'src/modules/FileDetails/slice';
import explorerReducer from 'src/modules/Explorer/store/slice';
import processSlice from 'src/modules/Process/store/slice';
import reviewSlice from 'src/modules/Review/store/reviewSlice';

const rootReducer = combineReducers({
  fileReducer,
  commonReducer,
  processSlice,
  reviewSlice,
  fileDetailsSlice,
  annotationReducer,
  explorerReducer,
  annotationLabelReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export type ThunkConfig = { state: RootState };

export default rootReducer;
