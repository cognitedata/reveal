import { combineReducers } from 'redux';

import appReducer from 'modules/app';

const createRootReducer = () =>
  combineReducers({
    app: appReducer,
  });

export type RootState = ReturnType<ReturnType<typeof createRootReducer>>;

export default createRootReducer;
