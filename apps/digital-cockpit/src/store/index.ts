import { StoreEnhancer, applyMiddleware, compose, createStore } from 'redux';
import ReduxThunk, { ThunkMiddleware } from 'redux-thunk';
import { devToolsEnhancer } from 'redux-devtools-extension';
import { StoreAction, StoreState } from './types';

import rootReducer from './reducer';

const middleware = [ReduxThunk as ThunkMiddleware<StoreState, StoreAction>];
const enhancers: StoreEnhancer[] = [];

if (process.env.NODE_ENV !== 'production') {
  enhancers.push(devToolsEnhancer({}));
}

const composedEnhancers: StoreEnhancer = compose(
  applyMiddleware(...middleware),
  ...enhancers
);

export const configureStore = (initialState?: StoreState) =>
  createStore(
    rootReducer,
    (initialState || {}) as StoreState,
    composedEnhancers
  );

const store = configureStore();

export default store;
