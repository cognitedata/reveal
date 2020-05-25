import "regenerator-runtime/runtime";
import React from "react";
import ReactDOM from "react-dom";
import SubsurfaceVisualizer from "./SubsurfaceVisualizer";
import SubsurfaceReducer from "./redux/reducers/main";
import { createStore } from "redux";

const store = createStore(SubsurfaceReducer, {});

const root = document.createElement("div");
root.setAttribute("id", "root");
document.body.appendChild(root);

ReactDOM.render(<SubsurfaceVisualizer store={store} />, root);
