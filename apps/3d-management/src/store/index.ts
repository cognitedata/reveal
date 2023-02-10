import { applyMiddleware, combineReducers, compose, createStore } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import { isProduction } from '@cognite/cdf-utilities';
import ReduxThunk from 'redux-thunk';

import AppReducer from 'store/modules/App';
import toolbarReducer from 'store/modules/toolbar';
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
