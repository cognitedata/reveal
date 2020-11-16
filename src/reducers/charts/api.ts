import ChartService from 'services/ChartService';
import { AppThunk } from 'store';
import chartSlice from './slice';

export const fetchAllCharts = (): AppThunk => async (dispatch, getState) => {
  if (getState().charts.status.status === 'LOADING') {
    // Do nothing if we're already loading data
    return;
  }
  const { tenant } = getState().environment;

  if (!tenant) {
    // Must have tenant set
    return;
  }

  dispatch(chartSlice.actions.startLoadingAllCharts());

  try {
    const chartService = new ChartService(tenant);
    const allCharts = await chartService.getCharts();

    dispatch(chartSlice.actions.finishedLoadingAllCharts(allCharts));
  } catch (e) {
    dispatch(chartSlice.actions.failedLoadingAllCharts(e));
  }
};
