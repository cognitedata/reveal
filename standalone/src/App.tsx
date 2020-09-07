import React, { useEffect, useState } from "react";
import "./App.css";
import {
  NodeVisualizer,
  NodeVisualizerReducer,
  NodeVisualizerMiddleware,
  SyntheticSubSurfaceModule,
  ThreeModule,
  Modules, BaseRootNode,
} from "@cognite/node-visualizer";
import { createStore, combineReducers, applyMiddleware, compose } from "redux";
import { Provider } from "react-redux";
import { createMuiTheme, ThemeProvider } from "@material-ui/core/styles";
import { grey } from "@material-ui/core/colors";

// @ts-ignore
const composeEnhancers = typeof window === 'object' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
      // Specify extension’s options like name, actionsBlacklist, actionsCreators, serialize...
}) : compose;

const enhancer = composeEnhancers(
  applyMiddleware(...NodeVisualizerMiddleware),
);

const store = createStore(
  combineReducers({ ...NodeVisualizerReducer }),
  enhancer
);

// customize the colors for changing UI style
const theme = createMuiTheme({
  palette: {
    primary: {
      main: grey[300]
    },
    secondary: {
      main: grey[50]
    }
  },
  typography: {
    htmlFontSize: 16,
    fontSize: 16 * 0.75,
    h2: {
      fontSize: 14
    },
    body1: {
      fontSize: 16 * 0.75
    }
  }
});

function App()
{

  const [root, setRoot] = useState<BaseRootNode>();

  const modules = Modules.instance;
  // Setup modules
  modules.add(new ThreeModule());

  useEffect(() => {
    modules.add(new SyntheticSubSurfaceModule());
    modules.install();
    const rootNode = modules.createRoot();
    setRoot(rootNode);

    return () => {
      // clean modules on unmount
      modules.clearModules();
    };
  }, []);

  return (
    <div className="App">
      <Provider store={ store }>
        <ThemeProvider theme={ theme }>
          <NodeVisualizer root={ root }/>
        </ThemeProvider>
      </Provider>
    </div>
  );
}

export default App;
