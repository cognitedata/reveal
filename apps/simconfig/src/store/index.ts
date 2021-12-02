import { configureStore } from '@reduxjs/toolkit';

import { simulatorReducer } from './simulator';
import { groupReducer } from './group';
import { datasetReducer } from './dataset';
import { fileReducer } from './file';
import { boundaryConditionReducer } from './boundaryCondition';
import { eventReducer } from './event';
import { notificationReducer } from './notification';
import { samplingConfigurationReducer } from './samplingConfiguration';

export const store = configureStore({
  reducer: {
    dataset: datasetReducer,
    group: groupReducer,
    simulator: simulatorReducer,
    file: fileReducer,
    boundaryCondition: boundaryConditionReducer,
    event: eventReducer,
    notification: notificationReducer,
    samplingConfiguration: samplingConfigurationReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
