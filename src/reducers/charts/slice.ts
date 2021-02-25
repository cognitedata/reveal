import { Timeseries } from '@cognite/sdk';
import {
  createSlice,
  PayloadAction,
  createEntityAdapter,
  Update,
} from '@reduxjs/toolkit';
import { AxisUpdate } from 'components/PlotlyChart';
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
    failedLoadingAllCharts: (state, action: PayloadAction<Error>) => {
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

    // Editing chart (add/remove sources, etc)
    removeChart: (state, action: PayloadAction<Chart>) => {
      chartAdapter.removeOne(state, action.payload.id);
    },

    setInputUnit: (
      state,
      action: PayloadAction<{
        id: string;
        timeSeriesId: string;
        unit?: string;
      }>
    ) => {
      const { id, timeSeriesId } = action.payload;
      const chart = state.entities[id];
      const timeSeries = chart?.timeSeriesCollection?.find(
        (entry) => entry.id === timeSeriesId
      )!;
      timeSeries.unit = action.payload.unit;
      chartAdapter.updateOne(state, {
        id,
        changes: {
          ...chart,
        },
      });
    },

    setOutputUnit: (
      state,
      action: PayloadAction<{
        id: string;
        timeSeriesId: string;
        unit?: string;
      }>
    ) => {
      const { id, timeSeriesId } = action.payload;
      const chart = state.entities[id];
      const timeSeries = chart?.timeSeriesCollection?.find(
        (entry) => entry.id === timeSeriesId
      )!;
      timeSeries.preferredUnit = action.payload.unit;
      chartAdapter.updateOne(state, {
        id,
        changes: {
          ...chart,
        },
      });
    },

    addTimeSeries: (
      state,
      action: PayloadAction<{ id: string; timeSeries: Timeseries }>
    ) => {
      const { id, timeSeries } = action.payload;
      const chart = state.entities[id];
      chartAdapter.updateOne(state, {
        id,
        changes: {
          timeSeriesCollection: [
            {
              id: timeSeries.externalId,
              name: timeSeries.externalId,
              unit: timeSeries.unit || '*',
              originalUnit: timeSeries.unit || '*',
              preferredUnit: timeSeries.unit || '*',
              color: getEntryColor(),
              lineWeight: 2,
              lineStyle: 'solid',
              enabled: true,
              description: timeSeries.description || '-',
            } as ChartTimeSeries,
            ...(chart?.timeSeriesCollection || []),
          ],
        },
      });
    },

    toggleTimeSeries: (
      state,
      action: PayloadAction<{ id: string; timeSeriesId: string }>
    ) => {
      const { id, timeSeriesId } = action.payload;
      const chart = state.entities[id];
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
      const chart = state.entities[id];
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
      const chart = state.entities[id];
      chartAdapter.updateOne(state, {
        id,
        changes: {
          timeSeriesCollection: chart?.timeSeriesCollection?.filter(
            (timeSeries) => timeSeries.id !== timeSeriesId
          ),
        },
      });
    },

    renameTimeSeries: (
      state,
      action: PayloadAction<{ id: string; timeSeriesId: string; name: string }>
    ) => {
      const { id, timeSeriesId, name } = action.payload;
      const chart = state.entities[id];
      chartAdapter.updateOne(state, {
        id,
        changes: {
          timeSeriesCollection: chart?.timeSeriesCollection?.map(
            (timeSeries) => {
              return {
                ...timeSeries,
                name: timeSeries.id === timeSeriesId ? name : timeSeries.name,
              };
            }
          ),
        },
      });
    },

    renameWorkflow: (
      state,
      action: PayloadAction<{ id: string; workflowId: string; name: string }>
    ) => {
      const { id, workflowId, name } = action.payload;
      const chart = state.entities[id];
      chartAdapter.updateOne(state, {
        id,
        changes: {
          workflowCollection: chart?.workflowCollection?.map((workflow) => {
            return {
              ...workflow,
              name: workflow.id === workflowId ? name : workflow.name,
            };
          }),
        },
      });
    },

    changeDateRange: (
      state,
      action: PayloadAction<{ id: string; dateFrom?: Date; dateTo?: Date }>
    ) => {
      const { id, dateFrom, dateTo } = action.payload;
      const chart = state.entities[id];
      chartAdapter.updateOne(state, {
        id,
        changes: {
          dateFrom: (dateFrom || new Date(chart?.dateFrom!)).toJSON(),
          dateTo: (dateTo || new Date(chart?.dateTo!)).toJSON(),
        },
      });
    },

    changeVisibleDateRange: (
      state,
      action: PayloadAction<{ id: string; range: any[] }>
    ) => {
      const { id, range } = action.payload;
      const chart = state.entities[id];
      chartAdapter.updateOne(state, {
        id,
        changes: {
          visibleRange: range || chart?.visibleRange,
        },
      });
    },

    changeSourceYaxis: (
      state,
      action: PayloadAction<{
        id: string;
        axisUpdates: AxisUpdate[];
      }>
    ) => {
      const { id, axisUpdates } = action.payload;
      const chart = state.entities[id];

      chartAdapter.updateOne(state, {
        id,
        changes: {
          timeSeriesCollection: chart?.timeSeriesCollection?.map(
            (timeSeries) => {
              const matchingUpdate = axisUpdates
                .filter(({ type }) => type === 'timeseries')
                .find((update) => update.id === timeSeries.id);

              return {
                ...timeSeries,
                range: matchingUpdate ? matchingUpdate.range : timeSeries.range,
              };
            }
          ),
          workflowCollection: chart?.workflowCollection?.map((workflow) => {
            const matchingUpdate = axisUpdates
              .filter(({ type }) => type === 'workflow')
              .find((update) => update.id === workflow.id);

            return {
              ...workflow,
              range: matchingUpdate ? matchingUpdate.range : workflow.range,
            };
          }),
        },
      });
    },

    changeTimeseriesColor: (
      state,
      action: PayloadAction<{ id: string; timeSeriesId: string; color: string }>
    ) => {
      const { id, timeSeriesId, color } = action.payload;
      const chart = state.entities[id];
      chartAdapter.updateOne(state, {
        id,
        changes: {
          timeSeriesCollection: chart?.timeSeriesCollection?.map(
            (timeSeries) => {
              return {
                ...timeSeries,
                color:
                  timeSeries.id === timeSeriesId ? color : timeSeries.color,
              };
            }
          ),
        },
      });
    },

    changeWorkflowColor: (
      state,
      action: PayloadAction<{ id: string; workflowId: string; color: string }>
    ) => {
      const { id, workflowId, color } = action.payload;
      const chart = state.entities[id];
      chartAdapter.updateOne(state, {
        id,
        changes: {
          workflowCollection: chart?.workflowCollection?.map((workflow) => {
            return {
              ...workflow,
              color: workflow.id === workflowId ? color : workflow.color,
            };
          }),
        },
      });
    },

    changeTimeseriesLineWeight: (
      state,
      action: PayloadAction<{
        id: string;
        timeSeriesId: string;
        lineWeight: number;
      }>
    ) => {
      const { id, timeSeriesId, lineWeight } = action.payload;
      const chart = state.entities[id];

      const timeSeries = chart?.timeSeriesCollection?.find(
        (entry) => entry.id === timeSeriesId
      )!;
      timeSeries.lineWeight = lineWeight;
      chartAdapter.updateOne(state, {
        id,
        changes: {
          ...chart,
        },
      });
    },

    changeWorkflowLineWeight: (
      state,
      action: PayloadAction<{
        id: string;
        workflowId: string;
        lineWeight: number;
      }>
    ) => {
      const { id, workflowId, lineWeight } = action.payload;
      const chart = state.entities[id];

      const workflow = chart?.workflowCollection?.find(
        (entry) => entry.id === workflowId
      )!;
      workflow.lineWeight = lineWeight;
      chartAdapter.updateOne(state, {
        id,
        changes: {
          ...chart,
        },
      });
    },

    changeTimeseriesLineStyle: (
      state,
      action: PayloadAction<{
        id: string;
        timeSeriesId: string;
        lineStyle: 'solid' | 'dashed' | 'dotted';
      }>
    ) => {
      const { id, timeSeriesId, lineStyle } = action.payload;
      const chart = state.entities[id];
      const timeSeries = chart?.timeSeriesCollection?.find(
        (entry) => entry.id === timeSeriesId
      )!;
      timeSeries.lineStyle = lineStyle;
      chartAdapter.updateOne(state, {
        id,
        changes: {
          ...chart,
        },
      });
    },

    changeWorkflowLineStyle: (
      state,
      action: PayloadAction<{
        id: string;
        workflowId: string;
        lineStyle: 'solid' | 'dashed' | 'dotted';
      }>
    ) => {
      const { id, workflowId, lineStyle } = action.payload;
      const chart = state.entities[id];

      const workflow = chart?.workflowCollection?.find(
        (entry) => entry.id === workflowId
      )!;
      workflow.lineStyle = lineStyle;
      chartAdapter.updateOne(state, {
        id,
        changes: {
          ...chart,
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
    failedStoringNewChart: (state, action: PayloadAction<Error>) => {
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
