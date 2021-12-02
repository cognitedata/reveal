import { createSlice } from '@reduxjs/toolkit';
import { RequestStatus } from 'store/types';
import { partialUpdate } from 'store/utils';

import { eventsAdapter, initialState } from './constants';
import {
  fetchEventHistoryByCalculationId,
  fetchLatestEventByCalculationId,
  runNewCalculation,
} from './thunks';

export const eventSlice = createSlice({
  name: 'event',
  initialState,
  reducers: {
    setSelectedEvent: (state, action) =>
      partialUpdate(state, {
        currentEvent: action.payload,
      }),
    resetSelectedEvent: (state) =>
      partialUpdate(state, {
        currentEvent: undefined,
      }),
  },
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

    builder
      .addCase(fetchEventHistoryByCalculationId.pending, (state) =>
        partialUpdate(state, {
          requestStatus: RequestStatus.LOADING,
        })
      )
      .addCase(fetchEventHistoryByCalculationId.fulfilled, (state, action) => {
        return partialUpdate(state, {
          requestStatus: RequestStatus.SUCCESS,
          initialized: true,
          eventHistory: action.payload,
        });
      })
      .addCase(fetchEventHistoryByCalculationId.rejected, (state) =>
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

export const { setSelectedEvent, resetSelectedEvent } = eventSlice.actions;
export const eventReducer = eventSlice.reducer;
