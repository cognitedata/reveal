import 'reset-css';
import React from "react";
import { Provider } from "react-redux";
import { createStore } from "redux";

import './styles/css/index.css';
import "./styles/css/react-split-pane.css"
import reducers from "./redux/reducers";

/**
 * Root component
 */
export default ({ initialState = {}, children }:
  { initialState?: {}, children: JSX.Element }) => {
  return (
    <Provider
      store={createStore(reducers, initialState)}>
      {children}
    </Provider>
  );
};
