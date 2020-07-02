import React, {useEffect} from "react";
import "./App.css";
import {
  NodeVisualizer,
  SubsurfaceReducer,
  SubsurfaceMiddleware,
  SyntheticSubSurfaceModule,
  ThreeModule,
  Modules
} from "@cognite/subsurface-visualizer";
import {createStore, combineReducers, applyMiddleware, compose} from "redux";
import {Provider} from "react-redux";

// @ts-ignore
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore(
  combineReducers({ ...SubsurfaceReducer }),
  compose(applyMiddleware(...SubsurfaceMiddleware)) // comment this line to enable redux dev tools
  //composeEnhancers(applyMiddleware(...SubsurfaceMiddleware))  // uncomment to enable redux dev tools
);

function App() {

  // Setup modules
  const modules = Modules.instance;

  useEffect(() => {
    return () => {
      // clean modules on unmount
      modules.clearModules();
    };
  });

  // Setup modules
  modules.add(new ThreeModule());
  modules.add(new SyntheticSubSurfaceModule());
  modules.install();

  const rootObj = modules.createRoot();

  return (
    <div className="App">
      <Provider store={store}>
        <NodeVisualizer root={rootObj}/>
      </Provider>
    </div>
  );
}

export default App;
