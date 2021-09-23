import { configureStore } from '@reduxjs/toolkit';
import fileInfoReducer from 'components/forms/ModelForm/slices';

import simulatorReducer from './simulator/simulatorSlice';

export const store = configureStore({
  reducer: {
    simulator: simulatorReducer,
    fileInfo: fileInfoReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
