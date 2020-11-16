import { combineReducers } from 'redux';
import environment from './environment';
import charts from './charts';

const rootReducer = combineReducers({
  environment: environment.reducer,
  charts: charts.reducer,
});

export default rootReducer;

export type RootState = ReturnType<typeof rootReducer>;
