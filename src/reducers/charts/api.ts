import subDays from 'date-fns/subDays';
import { toast } from '@cognite/cogs.js';
import { Timeseries } from '@cognite/sdk';
import { nanoid } from '@reduxjs/toolkit';
import { selectTenant, selectUser } from 'reducers/environment';
import ChartService from 'services/ChartService';
import { AppThunk } from 'store';
import chartsSlice, { chartSelectors } from './slice';
import { Chart } from './types';

export const fetchAllCharts = (): AppThunk => async (dispatch, getState) => {
  const state = getState();
  const tenant = selectTenant(state);
  const { email: user } = selectUser(state);

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
    const chartService = new ChartService(tenant, user);
    const allCharts = await chartService.getCharts();

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
    const chartService = new ChartService(tenant, user);
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
    const chartService = new ChartService(tenant, user);
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
    const chartService = new ChartService(tenant, user);
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
    const chartService = new ChartService(tenant, user);
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
    const chartService = new ChartService(tenant, user);
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
    const chartService = new ChartService(tenant, user);
    await chartService.deleteChart(chart);
    toast.success('Chart deleted!');
  } catch (e) {
    toast.error('Failed to delete chart');
  }
};
