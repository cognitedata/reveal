import { TrajectoryColumnR } from 'modules/wellSearch/types';

export const TRAJECTORY_COLUMNS: TrajectoryColumnR[] = [
  {
    externalId: 'md',
    valueType: 'DOUBLE',
    name: 'md',
  },
  {
    externalId: 'azimuth',
    valueType: 'DOUBLE',
    name: 'azimuth',
  },
  {
    externalId: 'inclination',
    valueType: 'DOUBLE',
    name: 'inclination',
  },
  {
    externalId: 'tvd',
    valueType: 'DOUBLE',
    name: 'tvd',
  },
  {
    externalId: 'x_offset',
    valueType: 'DOUBLE',
    name: 'x_offset',
  },
  {
    externalId: 'y_offset',
    valueType: 'DOUBLE',
    name: 'y_offset',
  },
  {
    externalId: 'equivalent_departure',
    valueType: 'DOUBLE',
    name: 'equivalent_departure',
  },
];

export const TRAJECTORY_COLUMN_NAME_MAP = {
  md: 'measuredDepth',
  azimuth: 'azimuth',
  inclination: 'inclination',
  tvd: 'trueVerticalDepth',
  x_offset: 'eastOffset',
  y_offset: 'northOffset',
  equivalent_departure: 'equivalentDeparture',
};
