import { combineReducers } from 'redux';

import { SimulatorReducer } from './simulator/reducer';

const rootReducer = combineReducers({
  simulator: SimulatorReducer,
});

export type RootState = ReturnType<typeof rootReducer>;

export default rootReducer;
