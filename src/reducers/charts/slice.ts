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

const chartSlice = createSlice({
  name: 'charts',
  initialState: chartAdapter.getInitialState({
    status: { status: 'IDLE' } as LoadingStatus,
  }),
  reducers: {
    startLoadingAllCharts: (state) => {
      state.status.status = 'LOADING';
    },
    finishedLoadingAllCharts: (state, action: PayloadAction<Chart[]>) => {
      state.status.status = 'SUCCESS';
      chartAdapter.setAll(state, action.payload);
    },
    failedLoadingAllCharts: (state, action: PayloadAction<string>) => {
      state.status.status = 'FAILED';
      state.status.error = action.payload;
    },

    storedNewWorkflow: (state, action: PayloadAction<Update<Chart>>) => {
      chartAdapter.updateOne(state, action.payload);
    },
  },
});

export default chartSlice;

export type ChartAction = ReturnType<ValueOf<typeof chartSlice.actions>>;
export type ChartState = ReturnType<typeof chartSlice.reducer>;

export const chartSelectors = chartAdapter.getSelectors<RootState>(
  (state) => state.charts
);
