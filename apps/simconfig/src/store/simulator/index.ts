import { createSlice } from '@reduxjs/toolkit';

import { RequestStatus } from 'store/constants';

import { partialUpdate } from '../utils';

import { initialState } from './constants';
import { fetchSimulators } from './thunks';

export const simulatorSlice = createSlice({
  name: 'simulator',
  // `createSlice` will infer the state type from the `initialState` argument
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchSimulators.pending, (state) =>
        partialUpdate(state, {
          requestStatus: RequestStatus.Loading,
        })
      )
      .addCase(fetchSimulators.fulfilled, (state, action) =>
        partialUpdate(state, {
          requestStatus: RequestStatus.Success,
          initialized: true,
          simulators: action.payload,
        })
      )
      .addCase(fetchSimulators.rejected, (state) =>
        partialUpdate(state, {
          requestStatus: RequestStatus.Error,
        })
      );
  },
});

export const simulatorReducer = simulatorSlice.reducer;
