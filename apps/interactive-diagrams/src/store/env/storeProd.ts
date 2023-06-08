import createRootReducer from '@interactive-diagrams-app/store/reducer';
import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';

export function createStore(): any {
  const middleware = getDefaultMiddleware({
    serializableCheck: false,
    immutableCheck: false,
  });
  // const enhancers = [];
  const store = configureStore({
    reducer: createRootReducer(),
    middleware,
    devTools: false,
  });

  return store;
}
