import subDays from 'date-fns/subDays';
import { toast } from '@cognite/cogs.js';
import { Timeseries } from '@cognite/sdk';
import { nanoid } from '@reduxjs/toolkit';
import { selectTenant, selectUser } from 'reducers/environment';
import ChartService from 'services/ChartService';
import { AppThunk } from 'store';
import { getEntryColor } from 'utils/colors';
import chartsSlice, { chartSelectors } from './slice';
import { Chart, ChartWorkflow } from './types';
import { node as TimeSeriesReferenceNode } from './Nodes/TimeSeriesReference';
import { node as OutputSeriesNode } from './Nodes/OutputSeries';

export const fetchAllCharts = (): AppThunk => async (dispatch, getState) => {
  const state = getState();
  const tenant = selectTenant(state);
  const user = selectUser(state);

  if (state.charts.status.status === 'LOADING') {
    // Do nothing if we're already loading data
    return;
  }

  if (!tenant || !user) {
    // Must have tenant set
    return;
  }

  dispatch(chartsSlice.actions.startLoadingAllCharts());

  try {
    const chartService = new ChartService(tenant);
    const allCharts = await chartService.getCharts(user);

    dispatch(chartsSlice.actions.finishedLoadingAllCharts(allCharts));
  } catch (e) {
    dispatch(chartsSlice.actions.failedLoadingAllCharts(e));
  }
};

export const createNewChart = (): AppThunk => async (dispatch, getState) => {
  const state = getState();
  const tenant = selectTenant(state);
  const { email: user } = selectUser(state);

  if (!tenant || !user) {
    // Must have tenant and user set
    return;
  }

  const dateFrom = subDays(new Date(), 30);
  dateFrom.setHours(0, 0);

  const dateTo = new Date();
  dateTo.setHours(23, 59);

  const id = nanoid();
  const newChart: Chart = {
    id,
    user,
    name: 'New chart',
    timeSeriesCollection: [],
    workflowCollection: [],
    dateFrom: dateFrom.toJSON(),
    dateTo: dateTo.toJSON(),
    public: false,
  };

  dispatch(chartsSlice.actions.startStoringNewChart());

  try {
    // Create the chart
    const chartService = new ChartService(tenant);
    await chartService.saveChart(newChart);

    dispatch(chartsSlice.actions.storedNewChart(newChart));
  } catch (e) {
    dispatch(dispatch(chartsSlice.actions.failedStoringNewChart(e)));
  }
};

export const duplicateChart = (chart: Chart): AppThunk => async (
  dispatch,
  getState
) => {
  const state = getState();
  const tenant = selectTenant(state);
  const { email: user } = selectUser(state);

  if (!tenant || !user) {
    // Must have tenant and user set
    return;
  }

  const id = nanoid();
  const newChart: Chart = {
    ...chart,
    id,
    name: `${chart.name} Copy`,
  };

  dispatch(chartsSlice.actions.startStoringNewChart());

  try {
    // Create the chart
    const chartService = new ChartService(tenant);
    await chartService.saveChart(newChart);

    dispatch(chartsSlice.actions.storedNewChart(newChart));
  } catch (e) {
    dispatch(dispatch(chartsSlice.actions.failedStoringNewChart(e)));
  }
};

export const saveExistingChart = (chart: Chart): AppThunk => async (
  _,
  getState
) => {
  const state = getState();
  const tenant = selectTenant(state);
  const { email: user } = selectUser(state);

  if (!tenant || !user) {
    // Must have tenant set
    return;
  }

  try {
    // Create the workflow
    const chartService = new ChartService(tenant);
    await chartService.saveChart(chart);
    toast.success('Chart saved!');
  } catch (e) {
    toast.error('Failed to save chart');
  }
};

export const renameChart = (chart: Chart): AppThunk => async (
  dispatch,
  getState
) => {
  const state = getState();
  const tenant = selectTenant(state);
  const { email: user } = selectUser(state);

  if (!tenant || !user) {
    // Must have tenant set
    return;
  }

  try {
    const updatedChart = {
      ...chart,
      // eslint-disable-next-line no-alert
      name: prompt('Rename chart', chart.name) || chart.name,
    } as Chart;

    dispatch(
      chartsSlice.actions.updateChart({
        id: chart.id,
        changes: updatedChart,
      })
    );
    // Create the workflow
    const chartService = new ChartService(tenant);
    await chartService.saveChart(updatedChart);
    toast.success('Chart renamed!');
  } catch (e) {
    toast.error('Failed to rename chart');
  }
};

export const addTimeSeriesToChart = (
  id: string,
  timeSeries: Timeseries
): AppThunk => async (dispatch, getState) => {
  const state = getState();
  const tenant = selectTenant(state);
  const { email: user } = selectUser(state);

  if (!tenant || !user) {
    // Must have tenant set
    return;
  }

  try {
    dispatch(
      chartsSlice.actions.addTimeSeries({
        id,
        timeSeries,
      })
    );

    const chart = chartSelectors.selectById(getState(), id);
    const chartService = new ChartService(tenant);
    await chartService.saveChart(chart!);
    toast.success('Added time series!');
  } catch (e) {
    toast.error('Failed to add time series');
  }
};

export const deleteChart = (chart: Chart): AppThunk => async (
  dispatch,
  getState
) => {
  const state = getState();
  const tenant = selectTenant(state);
  const { email: user } = selectUser(state);

  if (!tenant || !user) {
    // Must have tenant set
    return;
  }

  try {
    dispatch(chartsSlice.actions.removeChart(chart));
    // Create the workflow
    const chartService = new ChartService(tenant);
    await chartService.deleteChart(chart);
    toast.success('Chart deleted!');
  } catch (e) {
    toast.error('Failed to delete chart');
  }
};

export const addWorkflowToChart = (id: string): AppThunk => async (
  dispatch,
  getState
) => {
  const state = getState();
  const tenant = selectTenant(state);
  const { email: user } = selectUser(state);

  if (!tenant || !user) {
    // Must have tenant set
    return;
  }

  const workflow: ChartWorkflow = {
    id: nanoid(),
    name: 'New Calculation',
    color: getEntryColor(),
    lineWeight: 2,
    lineStyle: 'solid',
    enabled: true,
    nodes: [],
    connections: [],
  };

  try {
    dispatch(chartsSlice.actions.addWorkflow({ id, workflow }));
    const chart = chartSelectors.selectById(getState(), id);
    const chartService = new ChartService(tenant);
    await chartService.saveChart(chart!);
    toast.success('Created new calculation!');
  } catch (e) {
    toast.error('Failed to add calculation');
  }
};

export const createWorkflowFromTimeSeries = (
  chart: Chart,
  timeSeriesId: string
): AppThunk => async (dispatch, getState) => {
  const state = getState();
  const tenant = selectTenant(state);
  const { email: user } = selectUser(state);

  if (!chart) {
    return;
  }

  if (!tenant || !user) {
    // Must have tenant set
    return;
  }

  const chartTimeSeries = chart.timeSeriesCollection?.find(
    ({ id }) => timeSeriesId === id
  );

  const workflowId = nanoid();
  const inputNodeId = `${TimeSeriesReferenceNode.subtitle}-${nanoid()}`;
  const outputNodeId = `${OutputSeriesNode.subtitle}-${nanoid()}`;
  const connectionId = nanoid();

  const workflow: ChartWorkflow = {
    id: workflowId,
    name: `${chartTimeSeries?.name} (workflow)`,
    nodes: [
      {
        id: inputNodeId,
        ...TimeSeriesReferenceNode,
        title: chartTimeSeries?.name,
        subtitle: `DATAPOINTS (${chartTimeSeries?.id})`,
        functionData: {
          timeSeriesExternalId: timeSeriesId,
        },
        x: 50,
        y: 50,
      },
      {
        id: outputNodeId,
        ...OutputSeriesNode,
        x: 800,
        y: 70,
      },
    ],
    connections: {
      [connectionId]: {
        id: connectionId,
        inputPin: {
          nodeId: outputNodeId,
          pinId: OutputSeriesNode.inputPins[0].id,
        },
        outputPin: {
          nodeId: inputNodeId,
          pinId: TimeSeriesReferenceNode.outputPins[0].id,
        },
      },
    },
    color: getEntryColor(),
    lineWeight: 2,
    lineStyle: 'solid',
    enabled: true,
  };

  try {
    dispatch(chartsSlice.actions.addWorkflow({ id: chart.id, workflow }));
    const updatedChart = chartSelectors.selectById(getState(), chart.id);
    const chartService = new ChartService(tenant);
    await chartService.saveChart(updatedChart!);
    toast.success('Created new calculation!');
  } catch (e) {
    toast.error('Failed to create calculation');
  }
};

export const toggleChartAccess = (chart: Chart): AppThunk => async (
  dispatch,
  getState
) => {
  const state = getState();
  const tenant = selectTenant(state);

  if (!tenant) {
    // Must have tenant set
    return;
  }

  try {
    const updatedChart = {
      ...chart,
      public: chart.public !== undefined ? !chart.public : true,
    } as Chart;

    dispatch(
      chartsSlice.actions.updateChart({
        id: chart.id,
        changes: updatedChart,
      })
    );
    // Create the workflow
    const chartService = new ChartService(tenant);
    await chartService.saveChart(updatedChart);
    toast.success(
      `Chart set to ${updatedChart.public ? 'public' : 'private'}!`
    );
  } catch (e) {
    toast.error(
      `Failed to set chart to ${chart.public ? 'private' : 'public'}`
    );
  }
};
