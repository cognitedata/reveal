import { applyMiddleware, compose, createStore, StoreEnhancer } from 'redux';
import { devToolsEnhancer } from 'redux-devtools-extension';
import logger from 'redux-logger';
import ReduxThunk, { ThunkMiddleware } from 'redux-thunk';

import rootReducer from './reducer';
import {
  StoreState,
  StoreAction,
  AppStore,
  PartialStoreState,
  PreloadedStoreState,
} from './types';

const middleware = [ReduxThunk as ThunkMiddleware<StoreState, StoreAction>];

const enhancers: StoreEnhancer[] = [];

if (process.env.NODE_ENV !== 'production') {
  enhancers.push(devToolsEnhancer({}));
}

if (process.env.REACT_APP_ENABLE_REDUX_LOGGER === 'true') {
  middleware.push(logger);
}

const composedEnhancers: StoreEnhancer = compose(
  applyMiddleware(...middleware),
  ...enhancers
);

type RootReducer = typeof rootReducer;

export function configureStore(initialState: PartialStoreState = {}): AppStore {
  const store = createStore(
    rootReducer,
    initialState as PreloadedStoreState,
    composedEnhancers
  );

  if (process.env.NODE_ENV !== 'production') {
    if (module.hot) {
      module.hot.accept('./reducer', (): void => {
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const nextRootReducer: RootReducer = require('./reducer').default; // eslint-disable-line global-require
        store.replaceReducer(nextRootReducer);
      });
    }
  }

  return store;
}
