import "regenerator-runtime/runtime";
import React from "react";
import ReactDOM from "react-dom";
import SubsurfaceVisualizer from "./SubsurfaceVisualizer";
import SubsurfaceReducer from "./redux/reducers/main";
import { createStore, applyMiddleware } from "redux";
import SubsurfaceMiddleware from "./redux/middlewares/main";

const store = createStore(SubsurfaceReducer, {}, applyMiddleware(...SubsurfaceMiddleware));

const root = document.createElement("div");
root.setAttribute("id", "root");
document.body.appendChild(root);

ReactDOM.render(<SubsurfaceVisualizer store={store} />, root);
