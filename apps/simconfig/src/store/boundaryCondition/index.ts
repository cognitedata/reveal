import { createSlice } from '@reduxjs/toolkit';

import { RequestStatus } from '../types';
import { partialUpdate } from '../utils';

import { initialState } from './constants';
import { fetchBoundaryConditions } from './thunks';

export const boundaryConditionSlice = createSlice({
  name: 'boundaryCondition',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBoundaryConditions.pending, (state) =>
        partialUpdate(state, {
          requestStatus: RequestStatus.LOADING,
        })
      )
      .addCase(fetchBoundaryConditions.fulfilled, (state, action) =>
        partialUpdate(state, {
          requestStatus: RequestStatus.SUCCESS,
          initialized: true,
          boundaryConditions: action.payload,
        })
      )
      .addCase(fetchBoundaryConditions.rejected, (state) =>
        partialUpdate(state, {
          requestStatus: RequestStatus.ERROR,
        })
      );
  },
});
export const boundaryConditionReducer = boundaryConditionSlice.reducer;
