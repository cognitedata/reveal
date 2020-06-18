import "regenerator-runtime/runtime";
import React from "react";
import ReactDOM from "react-dom";
import SubsurfaceVisualizer from "./SubsurfaceVisualizer";
import SubsurfaceReducer from "./redux/reducers/SubsurfaceReducer";
import SubsurfaceMiddleware from "./redux/middlewares/main";
import { createStore, applyMiddleware, combineReducers, compose } from "redux";
import "./styles/scss/theme.scss";

// @ts-ignore
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore(
  combineReducers({ ...SubsurfaceReducer }),
  compose(applyMiddleware(...SubsurfaceMiddleware)) // comment this line to enable redux dev tools
  //composeEnhancers(applyMiddleware(...SubsurfaceMiddleware))  // uncomment to enable redux dev tools
);

const root = document.createElement("div");
root.setAttribute("id", "root");
document.body.appendChild(root);

ReactDOM.render(<SubsurfaceVisualizer store={store} />, root);
