import { combineReducers } from '@reduxjs/toolkit';
import { similarObjectJobsReducer } from './similarObjectJobs';
import { parsingJobsReducer } from './parsingJobs';
import { uploadJobsReducer } from './uploadJobs';
import { pnidPipelineReducer, pnidOptionReducer } from './pnidPipeline';

const reducer = combineReducers({
  similarObjectJobs: similarObjectJobsReducer,
  parsingJobs: parsingJobsReducer,
  uploadJobs: uploadJobsReducer,
  pnidPipelines: pnidPipelineReducer,
  pnidOption: pnidOptionReducer,
});

export { reducer };
