import { combineReducers } from '@reduxjs/toolkit';
import './commonActions';
import annotationReducer from '@vision/modules/Common/store/annotation/slice';
import commonReducer from '@vision/modules/Common/store/common/slice';
import fileReducer from '@vision/modules/Common/store/files/slice';
import explorerReducer from '@vision/modules/Explorer/store/slice';
import fileDetailsSlice from '@vision/modules/FileDetails/slice';
import processSlice from '@vision/modules/Process/store/slice';
import annotationDetailPanelReducer from '@vision/modules/Review/Containers/AnnotationDetailPanel/store/slice';
import annotatorWrapperReducer from '@vision/modules/Review/store/annotatorWrapper/slice';
import reviewSlice from '@vision/modules/Review/store/review/slice';

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
