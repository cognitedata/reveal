import { combineReducers } from '@reduxjs/toolkit';
import { parsingJobsReducer } from './parsingJobs';
import { uploadJobsReducer } from './uploadJobs';

const reducer = combineReducers({
  parsingJobs: parsingJobsReducer,
  uploadJobs: uploadJobsReducer,
});

export { reducer };
