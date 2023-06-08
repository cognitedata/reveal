import createRootReducer from '@interactive-diagrams-app/store/reducer';
import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';

export function createStore(): any {
  const middleware = getDefaultMiddleware({
    serializableCheck: false, // this is disabled because it marked all dates and timestamps
    immutableCheck: false,
  });
  // const enhancers = [];
  const store = configureStore({
    reducer: createRootReducer(),
    middleware,
    devTools: true,
  });

  if ((module as any).hot) {
    // Enable Webpack hot module replacement for reducers
    (module as any).hot.accept('store/reducer', () => {
      /* eslint-disable global-require */
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const nextReducer = require('store/reducer').default;
      store.replaceReducer(nextReducer);
    });
  }

  return store;
}
