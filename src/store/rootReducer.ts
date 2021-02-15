import { combineReducers } from '@reduxjs/toolkit';
import uploadedFiles from './uploadedFilesSlice';

const rootReducer = combineReducers({ uploadedFiles });

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
