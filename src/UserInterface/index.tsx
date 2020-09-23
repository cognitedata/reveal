import React from "react";
import ReactDOM from "react-dom";
import { Provider } from "react-redux";
import {
  createStore,
  applyMiddleware,
  combineReducers,
  compose,
  Store,
} from "redux";
import { App } from "@/UserInterface/App/App";
import { NodeVisualizerReducer } from "@/UserInterface/Redux/reducers/NodeVisualizerReducer";
import { NodeVisualizerMiddleware } from "@/UserInterface/Redux/Middlewares/NodeVisualizerMiddleware";
import "@/UserInterface/styles/scss/standalone-theme.scss";
import "@/UserInterface/styles/scss/styles.dev.scss";
import { Appearance } from "@/Core/States/Appearance";
import { setCssVariable } from "@/UserInterface/Foundation/Utils/cssUtils";

// @ts-ignore
// eslint-disable-next-line prettier/prettier
const composeEnhancers = typeof window === "object" && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({}) : compose;

const enhancer = composeEnhancers(
  applyMiddleware(...[NodeVisualizerMiddleware])
);

const store: Store = createStore(
  combineReducers({ ...NodeVisualizerReducer }),
  enhancer
);

const root = document.createElement("div");

root.setAttribute("id", "root");
document.body.appendChild(root);

setCssVariable(
  "--node-viz-default-font-size",
  `${Appearance.ApplicationDefaultFontSize}rem`
);
setCssVariable(
  "--node-viz-secondary-header-font-size",
  `${Appearance.ApplicationPanelHeaderFontSize}rem`
);
setCssVariable("--node-viz-icon-size", `${Appearance.treeIconSize}px`);
setCssVariable("--v-tree-icon-size", `${Appearance.treeIconSize}px`);
setCssVariable("--v-tree-item-height", `${Appearance.treeIconSize}px`);
setCssVariable("--v-tree-item-comp-width", `${Appearance.treeIconSize}px`);
setCssVariable("--v-tree-item-bottom-margin", `${Appearance.treeItemGap}px`);
setCssVariable("--v-tree-item-indentation", `${Appearance.treeIndentation}px`);
setCssVariable(
  "--node-viz-tree-background",
  (Appearance.treeBackgroundColor && Appearance.treeBackgroundColor.hex()) ||
    "inherit"
);
setCssVariable(
  "--node-viz-readonly-input-color",
  `${Appearance.readonlyInputColor}`
);

ReactDOM.render(
  <Provider store={store}>
    <App />
  </Provider>,
  root
);

// Type resolution for Redux toolbox
export type RootState = ReturnType<typeof store.getState>;
