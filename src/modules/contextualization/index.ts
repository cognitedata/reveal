import { combineReducers } from '@reduxjs/toolkit';
import { parsingJobsReducer } from './parsingJobs';
import { uploadJobsReducer } from './uploadJobs';
import { pnidPipelineReducer, pnidOptionReducer } from './pnidPipeline';

const reducer = combineReducers({
  parsingJobs: parsingJobsReducer,
  uploadJobs: uploadJobsReducer,
  pnidPipelines: pnidPipelineReducer,
  pnidOption: pnidOptionReducer,
});

export { reducer };
