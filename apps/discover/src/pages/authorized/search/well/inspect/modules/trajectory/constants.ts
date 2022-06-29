import { ChartCoordinates } from './types';

export const TRAJECTORY_COLUMN_NAME_MAP: Record<string, string> = {
  md: 'measuredDepth',
  azimuth: 'azimuth',
  inclination: 'inclination',
  tvd: 'trueVerticalDepth',
  x_offset: 'eastOffset',
  y_offset: 'northOffset',
  ed: 'equivalentDeparture',
};

export const CHART_PLANES = ['x', 'y', 'z'] as const;

export const EMPTY_CHART_COORDINATES: ChartCoordinates = {
  x: [],
  y: [],
  z: [],
};
