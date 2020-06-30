import React, {useEffect, useState} from "react";
import "./App.css";
import {
  NodeVisualizer,
  SubsurfaceReducer,
  SubsurfaceMiddleware,
  BaseRootNode,
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
  const [root, setRoot] = useState<BaseRootNode>(null);
  const [syntheticModule, setSyntheticModule] = useState<SyntheticSubSurfaceModule>(new SyntheticSubSurfaceModule());
  const [renderFlag, setRenderFlag] = useState(false);
  const modules = Modules.instance;

  // Setup modules
  useEffect(() => {
    modules.add(new ThreeModule());
    modules.add(syntheticModule);
    modules.install();
    setRoot(modules.createRoot());
  }, []);

  return (
    <div className="App">
      <Provider store={store}>
        <NodeVisualizer root={root} renderFlag={renderFlag} />
      </Provider>
    </div>
  );
}

export default App;
