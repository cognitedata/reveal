import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';

import { loadState, saveState } from 'src/utils/Localstorage';
import rootReducer from './rootReducer';

const persistedState = loadState();

const store = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware({}),
  preloadedState: { imagePreviewReducer: persistedState },
});

store.subscribe(() => {
  saveState(store.getState().imagePreviewReducer.predefinedCollections);
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
