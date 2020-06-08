import React from "react";
import "./App.css";
import {
  SubsurfaceVisualizer,
  SubsurfaceReducer,
  SubsurfaceMiddleware
} from "@cognite/subsurface-visualizer";

import { createStore, combineReducers, applyMiddleware } from "redux";
import { Provider } from "react-redux";

const store = createStore(
  combineReducers({ ...SubsurfaceReducer }),
  applyMiddleware(...SubsurfaceMiddleware)
);

function App() {
  return (
    <div className="App">
      <Provider store={store}>
        <SubsurfaceVisualizer store={store} />
      </Provider>
    </div>
  );
}

export default App;
