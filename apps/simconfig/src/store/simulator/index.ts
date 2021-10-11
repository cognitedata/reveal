import { createSlice } from '@reduxjs/toolkit';
import { RequestStatus } from 'store/types';

import { partialUpdate } from '../utils';

import { fetchSimulators } from './thunks';
import { initialState } from './constants';

export const simulatorSlice = createSlice({
  name: 'simulator',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSimulators.pending, (state) =>
        partialUpdate(state, {
          requestStatus: RequestStatus.LOADING,
        })
      )
      .addCase(fetchSimulators.fulfilled, (state, action) =>
        partialUpdate(state, {
          requestStatus: RequestStatus.SUCCESS,
          initialized: true,
          simulators: action.payload,
        })
      )
      .addCase(fetchSimulators.rejected, (state) =>
        partialUpdate(state, {
          requestStatus: RequestStatus.ERROR,
        })
      );
  },
});

export const simulatorReducer = simulatorSlice.reducer;
