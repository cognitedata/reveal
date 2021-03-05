import { combineReducers } from 'redux';
import environment from './environment';
import charts from './charts';
import search from './search';

const rootReducer = combineReducers({
  environment: environment.reducer,
  charts: charts.reducer,
  search: search.reducer,
});

export default rootReducer;

export type RootState = ReturnType<typeof rootReducer>;
