import { combineReducers } from 'redux';
import environment from './environment';
import charts from './charts';
import workflows from './workflows';
import search from './search';

const rootReducer = combineReducers({
  environment: environment.reducer,
  charts: charts.reducer,
  workflows: workflows.reducer,
  search: search.reducer,
});

export default rootReducer;

export type RootState = ReturnType<typeof rootReducer>;
