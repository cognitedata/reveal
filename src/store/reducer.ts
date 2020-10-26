import { combineReducers } from 'redux';
import { ConfigurationReducer } from './configuration/reducer';

const rootReducer = combineReducers({
  appConfiguration: ConfigurationReducer,
});

export default rootReducer;
