import { useDispatch } from 'react-redux';

import {
  ThunkDispatch,
  configureStore,
  getDefaultMiddleware,
} from '@reduxjs/toolkit';
import { AnyAction } from 'redux';

import { loadState, saveState } from '../utils/localStorage/LocalStorage';

import rootReducer from './rootReducer';

const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware({}),
  preloadedState: loadState(),
});

store.subscribe(() => {
  saveState(store.getState());
});

export type AppDispatch = typeof store.dispatch;
export const useThunkDispatch = () =>
  useDispatch<ThunkDispatch<any, void, AnyAction>>();

export default store;
