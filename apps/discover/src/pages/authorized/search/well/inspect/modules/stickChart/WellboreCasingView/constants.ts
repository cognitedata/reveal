import { DepthMeasurementUnit } from 'constants/units';

import { ChartColumn } from '../types';

export const RKB_LEVEL_LABEL = 'RKB level';
export const WATER_DEPTH_LABEL = 'Water depth';

export const EMPTY_SCHEMA_TEXT = 'This wellbore has no schema data';
export const LOADING_TEXT = 'Loading';

export const RKB_COLOR = 'var(--cogs-green-5)';
export const SEA_LEVEL_COLOR = 'var(--cogs-midblue-4)';
export const MUD_LINE_COLOR = '#000000';

export const DEPTH_SCALE_MIN_HEIGHT = 16;
export const DEPTH_BLOCK_LABEL_MINIMUM_HEIGHT = 20;

export const DEPTH_SCALE_LABEL_WIDTH = 74;
export const DEPTH_SCALE_LABEL_HEIGHT = 16;
export const DEPTH_SCALE_BORDER_LABEL_COLOR =
  'var(--cogs-decorative--blue--300)';
export const DEPTH_SCALE_LABEL_COLOR = 'var(--cogs-decorative--blue--200)';
export const DEPTH_SCALE_OVERLAP_LABEL_COLOR =
  'var(--cogs-decorative--blue--100)';

export const DEFAULT_DEPTH_MEASUREMENT_TYPE = DepthMeasurementUnit.MD;

export const DEFAULT_COLUMN_ORDER = [
  ChartColumn.CASINGS,
  ChartColumn.NPT,
  ChartColumn.NDS,
  ChartColumn.SUMMARY,
];
