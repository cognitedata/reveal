import { configureStore } from '@reduxjs/toolkit';

import { api as simconfigApi } from '@cognite/simconfig-api-sdk/rtk';

import { appReducer } from './app';
import { capabilitiesReducer } from './capabilities';
import { groupReducer } from './group';
import { errorNotificationMiddleware } from './middleware/errorNotificationMiddleware';
import { reauthenticationMiddleware } from './middleware/reauthenticationMiddleware';
import { simconfigApiPropertiesReducer } from './simconfigApiProperties';

export const store = configureStore({
  reducer: {
    app: appReducer,
    group: groupReducer,
    simconfigApiProperties: simconfigApiPropertiesReducer,
    capabilities: capabilitiesReducer,

    // RTK Query reducers
    simconfigApi: simconfigApi.reducer,
  },
  middleware: (getDefaultMiddleware) => [
    ...getDefaultMiddleware(),
    reauthenticationMiddleware,
    simconfigApi.middleware,
    errorNotificationMiddleware,
  ],
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
