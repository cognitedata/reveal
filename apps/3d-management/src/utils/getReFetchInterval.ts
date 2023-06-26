import { TimeUtils } from './timeUtils';

export const ELAPSED_ONE_HOUR_MILLI_SECONDS = 1000 * 3600;
export const ELAPSED_ONE_DAY_MILLI_SECONDS = 1000 * 3600 * 24;
export const QUERY_REFETCH_INTERVAL_BEFORE_HOUR_ELAPSED = 5000;
export const QUERY_REFETCH_INTERVAL_AFTER_HOUR_ELAPSED = 30000;

export const getReFetchInterval = (startTime: number) => {
  const currentTime = Date.now();

  if (
    TimeUtils.differenceInMilliseconds(currentTime, startTime) >=
    ELAPSED_ONE_DAY_MILLI_SECONDS
  ) {
    return false;
  }
  if (
    TimeUtils.differenceInMilliseconds(currentTime, startTime) >=
    ELAPSED_ONE_HOUR_MILLI_SECONDS
  ) {
    return QUERY_REFETCH_INTERVAL_AFTER_HOUR_ELAPSED;
  }
  return QUERY_REFETCH_INTERVAL_BEFORE_HOUR_ELAPSED;
};
