import { combineReducers } from 'redux';
import { ConfigurationReducer } from './configuration/reducer';
import { AuthReducer } from './auth/reducer';

const rootReducer = combineReducers({
  appConfiguration: ConfigurationReducer,
  auth: AuthReducer,
});

export default rootReducer;
