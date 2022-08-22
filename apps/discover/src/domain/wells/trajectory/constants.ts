import { TrajectoryCurveCoordinates } from './internal/types';

export const SOMETHING_WENT_WRONG_FETCHING_TVD =
  'Something went wrong in getting True Vertical Depth values.';

/**
 * There is a mismatch between the accessors trajectory chart config and WDL.
 * This is the mapping between those accessors.
 * Record<config-accessor, wdl-accessor>
 */
export const TRAJECTORY_COLUMN_NAME_MAP = {
  md: 'measuredDepth',
  azimuth: 'azimuth',
  inclination: 'inclination',
  tvd: 'trueVerticalDepth',
  x_offset: 'eastOffset',
  y_offset: 'northOffset',
  ed: 'equivalentDeparture',
} as const;

export const TRAJECTORY_CHART_PLANES = ['x', 'y', 'z'] as const;

export const EMPTY_CURVE_COORDINATES: TrajectoryCurveCoordinates = {
  x: [],
  y: [],
  z: [],
};

export const DEFAULT_TRAJECTORY_CURVE_COLOR = '#595959';
