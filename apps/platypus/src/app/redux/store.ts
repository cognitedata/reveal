/* eslint-disable @typescript-eslint/no-explicit-any */
import { KeyValueStore } from '@platypus-app/types';
import {
  configureStore,
  combineReducers,
  ThunkDispatch,
  AnyAction,
} from '@reduxjs/toolkit';
import { useDispatch } from 'react-redux';

import globalReducer from './reducers/global/globalReducer';
import dataModelSlice from './reducers/global/dataModelReducer';
import { environment } from '../../environments/environment';

const createReducer = (asyncReducers: any) => {
  return combineReducers({
    ...asyncReducers,
  });
};

const reducersRegistry = {
  global: globalReducer.reducer,
  dataModel: dataModelSlice.reducer,
};

export const rootReducer = combineReducers(reducersRegistry);

function createStore() {
  return configureStore({
    reducer: rootReducer,
    devTools: !environment.production,
    middleware: (getDefaultMiddleware) => [
      ...getDefaultMiddleware({ serializableCheck: false }),
    ],
  });
}

const store = createStore();

export function setupStore() {
  // Create an inject reducer function
  // This function adds the async reducer, and creates a new combined reducer
  (store as KeyValueStore).injectReducer = (key: string, asyncReducer: any) => {
    (reducersRegistry as any)[key] = asyncReducer;
    store.replaceReducer(createReducer(reducersRegistry) as any);
  };

  // Return the modified store
  return store;
}

export function getStore() {
  return setupStore();
}

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
export const useThunkDispatch = () =>
  useDispatch<ThunkDispatch<StoreType, void, AnyAction>>();
export type StoreType = ReturnType<typeof createStore>;

const storeInstance = getStore();
export default storeInstance;
