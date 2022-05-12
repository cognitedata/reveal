import { PlotConfig } from '../types';

export const RESISTIVITY_PLOTS: PlotConfig[] = [
  {
    measurementType: 'deep resistivity',
    color: 'red',
    scale: 'log',
  },
  {
    measurementType: 'medium resistivity',
    color: 'blue',
    scale: 'log',
  },
];
