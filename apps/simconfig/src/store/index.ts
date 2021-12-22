import { configureStore } from '@reduxjs/toolkit';

import { api as simconfigApi } from '@cognite/simconfig-api-sdk/rtk';

import { groupReducer } from './group';
import { notificationReducer } from './notification';
import { simconfigApiPropertiesReducer } from './simconfigApiProperties';
import { simulatorReducer } from './simulator';

export const store = configureStore({
  reducer: {
    group: groupReducer,
    simulator: simulatorReducer,
    notification: notificationReducer,
    simconfigApiProperties: simconfigApiPropertiesReducer,

    // RTK Query reducers
    simconfigApi: simconfigApi.reducer,
  },
  middleware: (getDefaultMiddleware) => [
    ...getDefaultMiddleware(),
    simconfigApi.middleware,
  ],
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
