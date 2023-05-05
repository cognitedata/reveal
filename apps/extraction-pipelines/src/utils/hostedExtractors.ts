import { ReadMQTTJobLog } from 'hooks/hostedExtractors';

const MQTT_JOB_LOG_ERROR_TYPES: ReadMQTTJobLog['type'][] = [
  'error',
  'startup_error',
];

const MQTT_JOB_LOG_SUCCESS_TYPES: ReadMQTTJobLog['type'][] = ['ok'];

const HOUR_IN_MS = 1000 * 60 * 60;
const DAY_IN_MS = HOUR_IN_MS * 24;

export const doesLogHaveErrorType = (log: ReadMQTTJobLog) => {
  return MQTT_JOB_LOG_ERROR_TYPES.includes(log.type);
};

export const doesLogHaveSuccessType = (log: ReadMQTTJobLog) => {
  return MQTT_JOB_LOG_SUCCESS_TYPES.includes(log.type);
};

export const getErrorCountInLast30Days = (logs?: ReadMQTTJobLog[]): number => {
  if (!logs) {
    return 0;
  }

  const now = new Date().getTime();
  const before = now - DAY_IN_MS * 30;

  const logsInLast30Days = logs.filter(
    ({ createdTime }) => createdTime >= before
  );
  const count = logsInLast30Days.reduce(
    (acc, cur) => (doesLogHaveErrorType(cur) ? acc + 1 : acc),
    0
  );

  return count;
};

export type DailyLogAggregation = {
  date: number;
  logs: ReadMQTTJobLog[];
};

export type AggregationInterval = 'hourly' | 'daily';

export const aggregateLogs = (
  logs: ReadMQTTJobLog[],
  interval: AggregationInterval,
  intervalCount: number
): DailyLogAggregation[] => {
  const now = new Date().getTime();
  const selectedInterval = interval === 'hourly' ? HOUR_IN_MS : DAY_IN_MS;
  const before = now - selectedInterval * intervalCount;
  const aggregations: DailyLogAggregation[] = Array(intervalCount)
    .fill(0)
    .map((_, index) => {
      return {
        date: now - index * selectedInterval,
        logs: [],
      };
    });

  if (!logs) {
    return [];
  }

  logs
    .filter(({ createdTime }) => createdTime >= before)
    .forEach((log) => {
      const daysBefore = Math.floor((now - log.createdTime) / DAY_IN_MS);
      aggregations[daysBefore].logs.push(log);
    });

  return aggregations;
};

export const aggregateLogsInLast30Days = (
  logs?: ReadMQTTJobLog[]
): DailyLogAggregation[] => {
  if (!logs) {
    return [];
  }

  return aggregateLogs(logs, 'daily', 30);
};

export const aggregateLogsInLast72Hours = (
  logs?: ReadMQTTJobLog[]
): DailyLogAggregation[] => {
  if (!logs) {
    return [];
  }

  return aggregateLogs(logs, 'hourly', 72);
};
