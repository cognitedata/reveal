import { combineReducers } from 'redux';
import { docPipelineReducer } from './documentPipeline';
import { similarObjectJobsReducer } from './similarObjectJobs';
import { parsingJobsReducer } from './parsingJobs';
import { pnidPipelineReducer, pnidOptionReducer } from './pnidPipeline';

export default combineReducers({
  similarObjectJobs: similarObjectJobsReducer,
  parsingJobs: parsingJobsReducer,
  pnidPipelines: pnidPipelineReducer,
  documentPipelines: docPipelineReducer,
  pnidOption: pnidOptionReducer,
});
