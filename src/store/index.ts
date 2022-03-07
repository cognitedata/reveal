import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';

import { loadState, saveState } from 'src/utils/localStorage/LocalStorage';
import rootReducer from './rootReducer';

const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware({}),
  preloadedState: loadState(),
});

store.subscribe(() => {
  saveState(store.getState());
});

if (process.env.NODE_ENV === 'development' && module.hot) {
  module.hot.accept('./rootReducer', () => {
    // eslint-disable-next-line global-require
    const newRootReducer = require('./rootReducer').default;
    store.replaceReducer(newRootReducer);
  });
}

export type AppDispatch = typeof store.dispatch;

export default store;
