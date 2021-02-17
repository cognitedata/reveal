import { combineReducers } from '@reduxjs/toolkit';
import processSlice from 'src/store/processSlice';
import uploadedFiles from './uploadedFilesSlice';

const rootReducer = combineReducers({ uploadedFiles, processSlice });

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
