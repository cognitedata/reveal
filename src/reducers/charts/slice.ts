import {
  createSlice,
  PayloadAction,
  createEntityAdapter,
  Update,
} from '@reduxjs/toolkit';
import { RootState } from 'reducers';
import { LoadingStatus } from 'reducers/types';
import { ValueOf } from 'typings/utils';
import { Chart } from './types';

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
