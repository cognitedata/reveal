import { applyMiddleware, combineReducers, compose, createStore } from "redux";
import { NodeVisualizerMiddleware } from "@/UserInterface/Redux/Middlewares/NodeVisualizerMiddleware";
import { NodeVisualizerReducer } from "@/UserInterface/Redux/reducers/NodeVisualizerReducer";

// @ts-ignore
const composeEnhancers = typeof window === "object" && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
  // Specify extension’s options like name, actionsBlacklist, actionsCreators, serialize...
}) : compose;

const enhancer = composeEnhancers(
  applyMiddleware(...[NodeVisualizerMiddleware]),
);

export function getStore() 
{
  const store = createStore(
    combineReducers({ ...NodeVisualizerReducer }),
    enhancer
  );
  
  return store;
}
