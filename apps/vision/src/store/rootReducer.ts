import { combineReducers } from '@reduxjs/toolkit';

import './commonActions';
import annotationReducer from '../modules/Common/store/annotation/slice';
import commonReducer from '../modules/Common/store/common/slice';
import fileReducer from '../modules/Common/store/files/slice';
import explorerReducer from '../modules/Explorer/store/slice';
import fileDetailsSlice from '../modules/FileDetails/slice';
import processSlice from '../modules/Process/store/slice';
import annotationDetailPanelReducer from '../modules/Review/Containers/AnnotationDetailPanel/store/slice';
import annotatorWrapperReducer from '../modules/Review/store/annotatorWrapper/slice';
import reviewSlice from '../modules/Review/store/review/slice';

const rootReducer = combineReducers({
  fileReducer,
  commonReducer,
  processSlice,
  reviewSlice,
  fileDetailsSlice,
  annotationReducer,
  explorerReducer,
  annotatorWrapperReducer,
  annotationDetailPanelReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export type ThunkConfig = { state: RootState };

export default rootReducer;
