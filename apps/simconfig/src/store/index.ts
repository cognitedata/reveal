import { configureStore } from '@reduxjs/toolkit';

import { api as simconfigApi } from '@cognite/simconfig-api-sdk/rtk';

import { groupReducer } from './group';
import { errorNotificationMiddleware } from './middleware/errorNotificationMiddleware';
import { simconfigApiPropertiesReducer } from './simconfigApiProperties';

export const store = configureStore({
  reducer: {
    group: groupReducer,
    simconfigApiProperties: simconfigApiPropertiesReducer,

    // RTK Query reducers
    simconfigApi: simconfigApi.reducer,
  },
  middleware: (getDefaultMiddleware) => [
    ...getDefaultMiddleware(),
    simconfigApi.middleware,
    errorNotificationMiddleware,
  ],
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
