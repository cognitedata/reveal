import { createSlice } from '@reduxjs/toolkit';
import { RequestStatus } from 'store/types';

import { initialState } from './constants';
import { fetchSimulators } from './thunks';

export const simulatorSlice = createSlice({
  name: 'simulator',
  initialState,
  reducers: {},
  extraReducers(builder) {
    builder
      .addCase(fetchSimulators.pending, (state) => ({
        ...state,
        requestStatus: RequestStatus.LOADING,
      }))
      .addCase(fetchSimulators.fulfilled, (state, action) => ({
        ...state,
        requestStatus: RequestStatus.SUCCESS,
        initialized: true,
        simulators: action.payload,
      }))
      .addCase(fetchSimulators.rejected, (state) => ({
        ...state,
        requestStatus: RequestStatus.ERROR,
      }));
  },
});

export const simulatorReducer = simulatorSlice.reducer;
