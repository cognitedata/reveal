import { createSlice } from '@reduxjs/toolkit';
import { initialState } from 'store/samplingConfiguration/constants';

import { RequestStatus } from '../types';
import { partialUpdate } from '../utils';

import {
  fetchSamplingConfiguration,
  fetchChartsInputLink,
  fetchChartsOutputLink,
} from './thunks';

export const samplingConfigurationSlice = createSlice({
  name: 'samplingConfiguration',
  initialState,
  reducers: {
    resetSamplingConfiguration: (state) =>
      partialUpdate(state, {
        samplingConfiguration: undefined,
      }),
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSamplingConfiguration.pending, (state) =>
        partialUpdate(state, {
          requestStatus: RequestStatus.LOADING,
        })
      )
      .addCase(fetchSamplingConfiguration.fulfilled, (state, action) =>
        partialUpdate(state, {
          requestStatus: RequestStatus.SUCCESS,
          samplingConfiguration: action.payload,
        })
      )
      .addCase(fetchSamplingConfiguration.rejected, (state) =>
        partialUpdate(state, {
          requestStatus: RequestStatus.ERROR,
          samplingConfiguration: undefined,
        })
      );

    builder.addCase(fetchChartsInputLink.fulfilled, (state, action) =>
      partialUpdate(state, {
        chartsInputLink: action.payload,
      })
    );

    builder.addCase(fetchChartsOutputLink.fulfilled, (state, action) =>
      partialUpdate(state, {
        chartsOutputLink: action.payload,
      })
    );
  },
});

export const samplingConfigurationReducer = samplingConfigurationSlice.reducer;
