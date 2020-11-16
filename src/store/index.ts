import rootReducer, { RootState } from 'reducers';
import {
  configureStore as configureToolkitStore,
  ThunkAction,
  Action,
  getDefaultMiddleware,
} from '@reduxjs/toolkit';
import { PickValueOf } from 'typings/utils';
import { PartialRootState } from 'store/types';

export default function configureStore(initialState: PartialRootState = {}) {
  return configureToolkitStore({
    reducer: rootReducer,
    preloadedState: initialState,
    devTools: process.env.NODE_ENV !== 'production',
    middleware: [
      ...getDefaultMiddleware({
        serializableCheck: false,
        immutableCheck: false,
      }),
    ],
  });
}

export type RootDispatch = PickValueOf<
  ReturnType<typeof configureStore>,
  'dispatch'
>;

export type AppThunk = ThunkAction<void, RootState, null, Action<string>>;
