import { combineReducers } from 'redux';
import { similarObjectJobsReducer } from './similarObjectJobs';
import { objectDetectionJobsReducer } from './objectDetectionJob';

export default combineReducers({
  similarObjectJobs: similarObjectJobsReducer,
  objectDetectionJobs: objectDetectionJobsReducer,
});
