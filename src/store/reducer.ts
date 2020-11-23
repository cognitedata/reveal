import { combineReducers } from 'redux';
import { SuitesReducer } from './suites/reducer';
import { AuthReducer } from './auth/reducer';

const rootReducer = combineReducers({
  suitesTable: SuitesReducer,
  auth: AuthReducer,
});

export default rootReducer;
