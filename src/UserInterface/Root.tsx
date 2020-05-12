import 'reset-css';
import React from "react";
import { Provider } from "react-redux";
import { createStore, applyMiddleware } from "redux";

import './styles/css/index.css';
import reducers from "./store/reducers";

/**
 * Root component
 */
export default ({ initialState = {}, children }: { initialState?: {}, children: JSX.Element }) =>
{
  return (
    <Provider
      store={createStore(reducers, initialState)}
    >
      {children}
    </Provider>
  );
};