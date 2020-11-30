import { Timeseries } from '@cognite/sdk';
import {
  createSlice,
  PayloadAction,
  createEntityAdapter,
  Update,
} from '@reduxjs/toolkit';
import { RootState } from 'reducers';
import { LoadingStatus } from 'reducers/types';
import { ValueOf } from 'typings/utils';
import { getEntryColor } from 'utils/colors';
import { Chart, ChartTimeSeries } from './types';

const chartAdapter = createEntityAdapter<Chart>({
  selectId: (chart) => chart.id,
});

const chartsSlice = createSlice({
  name: 'charts',
  initialState: chartAdapter.getInitialState({
    status: { status: 'IDLE' } as LoadingStatus,
    initialized: false,
  }),
  reducers: {
    // Loading charts
    startLoadingAllCharts: (state) => {
      state.status.status = 'LOADING';
    },
    finishedLoadingAllCharts: (state, action: PayloadAction<Chart[]>) => {
      state.status.status = 'SUCCESS';
      state.initialized = true;
      chartAdapter.setAll(state, action.payload);
    },
    failedLoadingAllCharts: (state, action: PayloadAction<string>) => {
      state.status.status = 'FAILED';
      state.initialized = true;
      state.status.error = action.payload;
    },

    // Attaching workflow to chart
    storedNewWorkflow: (state, action: PayloadAction<Update<Chart>>) => {
      chartAdapter.updateOne(state, action.payload);
    },

    // Editing chart (add/remove sources, etc)
    updateChart: (state, action: PayloadAction<Update<Chart>>) => {
      chartAdapter.updateOne(state, action.payload);
    },

    addTimeSeries: (
      state,
      action: PayloadAction<{ id: string; timeSeries: Timeseries }>
    ) => {
      const { id, timeSeries } = action.payload;
      const chart = chartAdapter.getSelectors().selectById(state, id);
      chartAdapter.updateOne(state, {
        id,
        changes: {
          timeSeriesCollection: [
            ...(chart?.timeSeriesCollection || []),
            {
              id: timeSeries.externalId,
              color: getEntryColor(),
              enabled: true,
            } as ChartTimeSeries,
          ],
        },
      });
    },

    toggleTimeSeries: (
      state,
      action: PayloadAction<{ id: string; timeSeriesId: string }>
    ) => {
      const { id, timeSeriesId } = action.payload;
      const chart = chartAdapter.getSelectors().selectById(state, id);
      const timeSeries = chart?.timeSeriesCollection?.find(
        (entry) => entry.id === timeSeriesId
      )!;
      timeSeries.enabled = !timeSeries?.enabled;
      chartAdapter.updateOne(state, {
        id,
        changes: {
          ...chart,
        },
      });
    },

    toggleWorkflow: (
      state,
      action: PayloadAction<{ id: string; workflowId: string }>
    ) => {
      const { id, workflowId } = action.payload;
      const chart = chartAdapter.getSelectors().selectById(state, id);
      const workflowEntry = chart?.workflowCollection?.find(
        (entry) => entry.id === workflowId
      )!;
      workflowEntry.enabled = !workflowEntry?.enabled;
      chartAdapter.updateOne(state, {
        id,
        changes: {
          ...chart,
        },
      });
    },

    removeTimeSeries: (
      state,
      action: PayloadAction<{ id: string; timeSeriesId: string }>
    ) => {
      const { id, timeSeriesId } = action.payload;
      const chart = chartAdapter.getSelectors().selectById(state, id);
      chartAdapter.updateOne(state, {
        id,
        changes: {
          timeSeriesCollection: chart?.timeSeriesCollection?.filter(
            (timeSeries) => timeSeries.id !== timeSeriesId
          ),
        },
      });
    },

    changeDateRange: (
      state,
      action: PayloadAction<{ id: string; dateFrom?: Date; dateTo?: Date }>
    ) => {
      const { id, dateFrom, dateTo } = action.payload;
      const chart = chartAdapter.getSelectors().selectById(state, id);
      chartAdapter.updateOne(state, {
        id,
        changes: {
          dateFrom: (dateFrom || new Date(chart?.dateFrom!)).toJSON(),
          dateTo: (dateTo || new Date(chart?.dateTo!)).toJSON(),
        },
      });
    },

    // Making new chart
    startStoringNewChart: (state) => {
      state.status.status = 'LOADING';
    },
    storedNewChart: (state, action: PayloadAction<Chart>) => {
      state.status.status = 'SUCCESS';
      chartAdapter.addOne(state, action.payload);
    },
    failedStoringNewChart: (state, action: PayloadAction<string>) => {
      state.status.status = 'FAILED';
      state.status.error = action.payload;
    },
  },
});

export default chartsSlice;

export type ChartAction = ReturnType<ValueOf<typeof chartsSlice.actions>>;
export type ChartState = ReturnType<typeof chartsSlice.reducer>;

export const chartSelectors = chartAdapter.getSelectors<RootState>(
  (state) => state.charts
);
