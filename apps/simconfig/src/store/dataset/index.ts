import { createSlice } from '@reduxjs/toolkit';
import { RequestStatus } from 'store/types';
import { partialUpdate } from 'store/utils';

import { initialState } from './constants';
import { fetchDatasets } from './thunks';

export const datasetSlice = createSlice({
  name: 'dataset',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDatasets.pending, (state) =>
        partialUpdate(state, {
          requestStatus: RequestStatus.LOADING,
        })
      )
      .addCase(fetchDatasets.fulfilled, (state, action) =>
        partialUpdate(state, {
          requestStatus: RequestStatus.SUCCESS,
          initialized: true,
          datasets: action.payload,
        })
      )
      .addCase(fetchDatasets.rejected, (state) =>
        partialUpdate(state, {
          requestStatus: RequestStatus.ERROR,
        })
      );
  },
});

export const datasetReducer = datasetSlice.reducer;
