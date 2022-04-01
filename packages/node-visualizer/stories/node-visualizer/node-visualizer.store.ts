import { applyMiddleware, combineReducers, compose, createStore } from 'redux';
import isObject from 'lodash/isObject';
import { NodeVisualizerMiddleware, NodeVisualizerReducer } from '../../src';

const composeEnhancers =
  isObject(window) && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({})
    : compose;

const enhancer = composeEnhancers(
  applyMiddleware(...[NodeVisualizerMiddleware])
);

export const store = createStore(
  combineReducers({ ...NodeVisualizerReducer }),
  enhancer
);
