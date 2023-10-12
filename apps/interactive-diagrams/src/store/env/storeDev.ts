import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';

import createRootReducer from '../reducer';

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

  // TODO: commenting this might help if not working in localhost
  // if ((module as any).hot) {
  //   // Enable Webpack hot module replacement for reducers
  //   (module as any).hot.accept(
  //     '@interactive-diagrams-app/store/reducer',
  //     () => {
  //       const nextReducer =
  //         /* eslint-disable global-require */
  //         // eslint-disable-next-line @typescript-eslint/no-var-requires
  //         require('@interactive-diagrams-app/store/reducer').default;
  //       store.replaceReducer(nextReducer);
  //     }
  //   );
  // }

  return store;
}
