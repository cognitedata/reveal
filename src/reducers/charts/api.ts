/* eslint-disable no-alert */

import { toast } from '@cognite/cogs.js';
import { nanoid } from '@reduxjs/toolkit';
import { selectTenant, selectUser } from 'reducers/environment';
import ChartService from 'services/ChartService';
import { AppThunk } from 'store';
import chartsSlice from './slice';
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

  const id = nanoid();
  const newChart: Chart = {
    id,
    user,
    name: prompt('Name your chart', 'New Chart') || 'New Chart',
    timeSeriesCollection: [],
    workflowCollection: [],
    dateFrom: new Date().toJSON(),
    dateTo: new Date().toJSON(),
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
    chartService.saveChart(chart);
    toast.success('Chart saved!');
  } catch (e) {
    toast.error('Failed to save chart');
  }
};
