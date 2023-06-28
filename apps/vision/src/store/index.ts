import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';
import { loadState, saveState } from '@vision/utils/localStorage/LocalStorage';

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

export default store;
