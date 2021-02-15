import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';

import rootReducer from './rootReducer';

const index = configureStore({
  reducer: rootReducer,
  middleware: getDefaultMiddleware({
    serializableCheck: {
      ignoredActions: [
        'uploadedFiles/addUploadedFile',
        'uploadedFiles/setUploadedFiles',
      ],
      ignoredPaths: ['uploadedFiles'],
    },
  }),
});

if (process.env.NODE_ENV === 'development' && module.hot) {
  module.hot.accept('./rootReducer', () => {
    // eslint-disable-next-line global-require
    const newRootReducer = require('./rootReducer').default;
    index.replaceReducer(newRootReducer);
  });
}

export type AppDispatch = typeof index.dispatch;

export default index;
