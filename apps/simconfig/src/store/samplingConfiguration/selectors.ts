import { StoreState } from 'store/types';

export const selectSamplingConfiguration = (state: StoreState) =>
  state.samplingConfiguration.samplingConfiguration;

export const selectChartInputLink = (state: StoreState) =>
  state.samplingConfiguration.chartsInputLink;

export const selectChartOutputLink = (state: StoreState) =>
  state.samplingConfiguration.chartsOutputLink;
