import "regenerator-runtime/runtime";
import React from "react";
import ReactDOM from "react-dom";
import SubsurfaceVisualizer from "./SubsurfaceVisualizer";
import SubsurfaceReducer from "./redux/reducers/SubsurfaceReducer";
import SubsurfaceMiddleware from "./redux/middlewares/main";
import { createStore, applyMiddleware, combineReducers } from "redux";

const store = createStore(
  combineReducers({ ...SubsurfaceReducer }),
  applyMiddleware(...SubsurfaceMiddleware)
);

const root = document.createElement("div");
root.setAttribute("id", "root");
document.body.appendChild(root);

ReactDOM.render(<SubsurfaceVisualizer store={store} />, root);
