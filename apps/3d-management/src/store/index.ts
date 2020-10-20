import { applyMiddleware, combineReducers, compose, createStore } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import { isProduction } from '@cognite/cdf-utilities';
import { connectRouter, routerMiddleware } from 'connected-react-router';
import ReduxThunk from 'redux-thunk';

import ModelReducer from 'src/store/modules/Model';
import AppReducer from 'src/store/modules/App';
import RevisionReducer from 'src/store/modules/Revision';
import FileReducer from 'src/store/modules/File';

const createRootReducer = (browserHistory) =>
  combineReducers({
    router: connectRouter(browserHistory),
    models: ModelReducer,
    app: AppReducer,
    revisions: RevisionReducer,
    files: FileReducer,
  });

export default function configureStore(browserHistory, initialState = {}) {
  const middlewares = [routerMiddleware(browserHistory), ReduxThunk];
  const enhancers = [applyMiddleware(...middlewares)];
  const composeEnhancers = !isProduction()
    ? composeWithDevTools({
        name: '3d-management',
      })
    : compose;

  return createStore(
    createRootReducer(browserHistory),
    initialState,
    composeEnhancers(...enhancers)
  );
}
