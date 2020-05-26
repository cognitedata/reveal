import React from "react";
import logo from "./logo.svg";
import "./App.css";
import {
  SubsurfaceVisualizer,
  SubsurfaceReducer
} from "@cognitedata/subsurface-visualizer";
import { createStore } from "redux";

function App() {
  const store = createStore(SubsurfaceReducer, {});
  return (
    <div className="App">
      <SubsurfaceVisualizer store={store} />
    </div>
  );
}

export default App;
