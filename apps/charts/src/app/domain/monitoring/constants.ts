const ONE_MINUTE = 60 * 1000;
const ONE_HOUR = 60 * ONE_MINUTE;

const SCHEDULE_MINUTE_OPTIONS_MAP = {
  1: 1 * ONE_MINUTE,
  5: 5 * ONE_MINUTE,
  20: 20 * ONE_MINUTE,
  30: 30 * ONE_MINUTE,
  45: 45 * ONE_MINUTE,
};

const SCHEDULE_HOUR_OPTIONS_MAP = {
  1: ONE_HOUR,
  12: 12 * ONE_HOUR,
  24: 24 * ONE_HOUR,
};

export const SCHEDULE_MINUTE_OPTIONS = Object.entries(
  SCHEDULE_MINUTE_OPTIONS_MAP
).map((entry) => ({ label: entry[0], value: entry[1] }));

export const SCHEDULE_HOUR_OPTIONS = Object.entries(
  SCHEDULE_HOUR_OPTIONS_MAP
).map((entry) => ({ label: entry[0], value: entry[1] }));

export const MONITORING_THRESHOLD_ID = 'monitoring-threshold';
export const MINIMUM_DURATION_LIMIT = 60;

export const CHARTS_FOLDER_PREFIX = 'charts-folder-';
