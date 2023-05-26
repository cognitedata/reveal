import { formatDate, formatDateCustom } from '@cognite/cogs.js';

import {
  ABSOLUTE_TIME_FORMAT,
  RELATIVE_TIME_THRESHOLD_IN_HOURS,
} from '../common';

// eslint-disable-next-line @nrwl/nx/enforce-module-boundaries

export const formatTime = (timestamp: number, absolute?: boolean) => {
  const shouldUseAbsolute =
    absolute ||
    Math.abs((new Date().getTime() - timestamp) / 1000 / 60 / 60) >
      RELATIVE_TIME_THRESHOLD_IN_HOURS;

  return shouldUseAbsolute
    ? getAbsoluteTime(timestamp)
    : getRelativeTime(timestamp);
};

export const getRelativeTime = (timestamp: number) => {
  return formatDate(timestamp, true).toLowerCase();
};

export const getAbsoluteTime = (timestamp: number) => {
  return formatDateCustom(timestamp, ABSOLUTE_TIME_FORMAT);
};

export const getDetailedTime = (timestamp: number) => {
  return new Date(timestamp).toISOString();
};
