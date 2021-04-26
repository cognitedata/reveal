import { combineReducers } from '@reduxjs/toolkit';
import { uploadJobsReducer } from './uploadJobs';
import { reducer as pnidParsingReducer } from './pnidParsing';

const reducer = combineReducers({
  uploadJobs: uploadJobsReducer,
  pnidParsing: pnidParsingReducer,
});

export { reducer };
