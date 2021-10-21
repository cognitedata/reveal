import { configureStore } from '@reduxjs/toolkit';

import { simulatorReducer } from './simulator';
import { groupReducer } from './group';
import { datasetReducer } from './dataset';
import { fileReducer } from './file';
import { boundaryConditionReducer } from './boundaryCondition';

export const store = configureStore({
  reducer: {
    dataset: datasetReducer,
    group: groupReducer,
    simulator: simulatorReducer,
    file: fileReducer,
    boundaryCondition: boundaryConditionReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
