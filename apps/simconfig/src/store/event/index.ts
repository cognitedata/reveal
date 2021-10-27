import { createSlice } from '@reduxjs/toolkit';
import { RequestStatus } from 'store/types';
import { partialUpdate } from 'store/utils';

import { eventsAdapter, initialState } from './constants';
import { fetchLatestEventByCalculationId, runNewCalculation } from './thunks';

export const eventSlice = createSlice({
  name: 'event',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchLatestEventByCalculationId.pending, (state) =>
        partialUpdate(state, {
          requestStatus: RequestStatus.LOADING,
        })
      )
      .addCase(fetchLatestEventByCalculationId.fulfilled, (state, action) => {
        if (!action.payload?.calculationId) {
          return partialUpdate(state, {
            requestStatus: RequestStatus.SUCCESS,
            initialized: true,
          });
        }
        return partialUpdate(state, {
          requestStatus: RequestStatus.SUCCESS,
          initialized: true,
          events: eventsAdapter.upsertOne(state.events, action.payload),
        });
      })
      .addCase(fetchLatestEventByCalculationId.rejected, (state) =>
        partialUpdate(state, {
          requestStatus: RequestStatus.ERROR,
        })
      );

    builder.addCase(runNewCalculation.pending, (state, action) => {
      if (!action?.meta?.arg?.item?.metadata?.calcConfig) {
        return;
      }
      partialUpdate(state, {
        events: eventsAdapter.updateOne(state.events, {
          id: action.meta.arg.item.metadata.calcConfig,
          changes: {
            metadata: {
              status: 'ready',
            },
          },
        }),
      });
    });
  },
});
export const eventReducer = eventSlice.reducer;
