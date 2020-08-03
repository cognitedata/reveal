import { createStore, applyMiddleware } from 'redux';
import ReduxThunk from 'redux-thunk';

import createRootReducer from 'reducers';

const middlewares = [ReduxThunk];
const enhancer = [applyMiddleware(...middlewares)];

export default function configureStore(initialState = {}) {
  return createStore(createRootReducer(), initialState, ...enhancer);
}
