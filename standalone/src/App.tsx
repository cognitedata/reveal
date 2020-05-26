import React from "react";
import "./App.css";
import {
  SubsurfaceVisualizer,
  SubsurfaceReducer,
  SubsurfaceMiddleware
} from "@cognitedata/subsurface-visualizer";
import { createStore, applyMiddleware } from "redux";

function App() {
  const store = createStore(SubsurfaceReducer, {}, applyMiddleware(...SubsurfaceMiddleware));
  return (
    <div className="App">
      <SubsurfaceVisualizer store={store} />
    </div>
  );
}

export default App;
