import { applyMiddleware, combineReducers, compose, createStore } from 'redux';
import isObject from 'lodash/isObject';
import { NodeVisualizerMiddleware } from 'UserInterface/Redux/Middlewares/NodeVisualizerMiddleware';
import { NodeVisualizerReducer } from 'UserInterface/Redux/reducers/NodeVisualizerReducer';

const composeEnhancers =
  // @ts-expect-error does not exist on window
  isObject(window) && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
    ? // @ts-expect-error does not exist on window
      window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
        // Specify extension’s options like name, actionsBlacklist, actionsCreators, serialize...
      })
    : compose;

const enhancer = composeEnhancers(
  applyMiddleware(...[NodeVisualizerMiddleware])
);

export function getStore() {
  return createStore(combineReducers({ ...NodeVisualizerReducer }), enhancer);
}
