import { Config, Data, Layout } from '../LineChart';
import { TimePeriod } from './types';

export const DEFAULT_DATAPOINTS_LIMIT = 20;

export const EMPTY_DATA: Data = {
  x: [],
  y: [],
};

export const LAYOUT: Partial<Layout> = {
  showLegend: false,
};

export const CONFIG: Partial<Config> = {
  scrollZoom: 'x',
  selectionZoom: [
    { trigger: 'default', direction: 'x+y' },
    { trigger: 'Shift', direction: 'x' },
  ],
  buttonZoom: 'x',
};

export const TIME_PERIOD_OPTIONS: TimePeriod[] = [
  '15Min',
  '1H',
  '6H',
  '12H',
  '1D',
  '1W',
  '1M',
  '1Y',
  '2Y',
  '5Y',
  '10Y',
];
