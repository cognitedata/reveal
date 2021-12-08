import { INITIAL_TEST_STATE } from './store';
import { configureStore } from '@reduxjs/toolkit';

import { rootReducer } from '@platypus-app/redux/store';

function configureTestStore(initialState = {}) {
  const combinedState = { ...INITIAL_TEST_STATE, ...initialState };
  return configureStore({
    reducer: rootReducer as any,
    preloadedState: combinedState,
    middleware: (getDefaultMiddleware) => [
      ...getDefaultMiddleware({ serializableCheck: false }),
    ],
  });
}

function configureRender(options: any) {
  const { redux = {} } = options;

  const store = configureTestStore(redux);

  return { store };
}

export default configureRender;
