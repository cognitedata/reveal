import { applyMiddleware, combineReducers, compose, createStore } from "redux";
import { NodeVisualizerReducer, NodeVisualizerMiddleware } from "@cognite/node-visualizer";

// @ts-ignore
const composeEnhancers = typeof window === "object" && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({}) : compose;

const enhancer = composeEnhancers(
  applyMiddleware(...[NodeVisualizerMiddleware]),
);

export const store = createStore(
  combineReducers({ ...NodeVisualizerReducer }),
  enhancer
);

