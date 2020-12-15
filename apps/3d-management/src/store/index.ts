import { applyMiddleware, combineReducers, compose, createStore } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import { isProduction } from '@cognite/cdf-utilities';
import { connectRouter, routerMiddleware } from 'connected-react-router';
import ReduxThunk from 'redux-thunk';

import AppReducer from 'src/store/modules/App';
import toolbarReducer from 'src/store/modules/toolbar';
import TreeViewReducer from './modules/TreeView';

export * from './types';

const createRootReducer = (browserHistory) =>
  combineReducers({
    router: connectRouter(browserHistory),
    app: AppReducer, // fixme: ridiculous naming - should be modelsTable or something
    treeView: TreeViewReducer,
    toolbar: toolbarReducer,
  });

export default function configureStore(browserHistory, initialState = {}) {
  const middlewares = [routerMiddleware(browserHistory), ReduxThunk];
  const composeEnhancers = !isProduction()
    ? composeWithDevTools({
        name: '3d-management',
      })
    : compose;

  return createStore(
    createRootReducer(browserHistory),
    initialState,
    composeEnhancers(applyMiddleware(...middlewares))
  );
}
