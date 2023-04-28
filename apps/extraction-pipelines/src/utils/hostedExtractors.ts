import { ReadMQTTJobLog } from 'hooks/hostedExtractors';

const MQTT_JOB_LOG_ERROR_TYPES: ReadMQTTJobLog['type'][] = [
  'error',
  'startup_error',
];

const DAY_IN_MS = 1000 * 60 * 60 * 24;

export const doesLogHaveErrorType = (log: ReadMQTTJobLog) => {
  return MQTT_JOB_LOG_ERROR_TYPES.includes(log.type);
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

export const aggregateLogsInLast30Days = (
  logs?: ReadMQTTJobLog[]
): DailyLogAggregation[] => {
  const now = new Date().getTime();
  const before = now - DAY_IN_MS * 30;
  const aggregations: DailyLogAggregation[] = Array(30)
    .fill(0)
    .map((_, index) => {
      return {
        date: now - index * DAY_IN_MS,
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
