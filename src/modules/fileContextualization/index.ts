import { combineReducers } from 'redux';
import { similarObjectJobsReducer } from './similarObjectJobs';
import { parsingJobsReducer } from './parsingJobs';
import { uploadJobsReducer } from './uploadJobs';
import { pnidPipelineReducer, pnidOptionReducer } from './pnidPipeline';

export default combineReducers({
  similarObjectJobs: similarObjectJobsReducer,
  parsingJobs: parsingJobsReducer,
  uploadJobs: uploadJobsReducer,
  pnidPipelines: pnidPipelineReducer,
  pnidOption: pnidOptionReducer,
});
