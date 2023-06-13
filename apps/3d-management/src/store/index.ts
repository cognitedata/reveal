import AppReducer from '@3d-management/store/modules/App';
import toolbarReducer from '@3d-management/store/modules/toolbar';
import { applyMiddleware, combineReducers, compose, createStore } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import ReduxThunk from 'redux-thunk';
import type {} from 'redux-thunk/extend-redux';

import { isProduction } from '@cognite/cdf-utilities';

import TreeViewReducer from './modules/TreeView';

export * from './types';

const createRootReducer = () =>
  combineReducers({
    app: AppReducer, // fixme: ridiculous naming - should be modelsTable or something
    treeView: TreeViewReducer,
    toolbar: toolbarReducer,
  });

export default function configureStore(initialState = {}) {
  const middlewares = [ReduxThunk];
  const composeEnhancers = !isProduction()
    ? composeWithDevTools({
        name: '3d-management',
      })
    : compose;

  return createStore(
    createRootReducer(),
    initialState,
    composeEnhancers(applyMiddleware(...middlewares))
  );
}
