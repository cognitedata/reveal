import { ReadMQTTJob, ReadMQTTJobLog } from 'hooks/hostedExtractors';

const MQTT_JOB_LOG_ERROR_TYPES: ReadMQTTJobLog['type'][] = [
  'error',
  'startup_error',
];
const MQTT_JOB_LOG_SUCCESS_TYPES: ReadMQTTJobLog['type'][] = ['ok'];

const MQTT_JOB_STATUS_ERROR_TYPES: ReadMQTTJob['status'][] = [
  'error',
  'startup_error',
];
const MQTT_JOB_STATUS_SUCCESS_TYPES: ReadMQTTJob['status'][] = ['running'];
const MQTT_JOB_STATUS_NEUTRAL_TYPES: ReadMQTTJob['status'][] = [
  'shutting_down',
  'waiting',
];

const HOUR_IN_MS = 1000 * 60 * 60;
const DAY_IN_MS = HOUR_IN_MS * 24;

export const doesLogHaveErrorType = (log: ReadMQTTJobLog) => {
  return MQTT_JOB_LOG_ERROR_TYPES.includes(log.type);
};

export const doesLogHaveSuccessType = (log: ReadMQTTJobLog) => {
  return MQTT_JOB_LOG_SUCCESS_TYPES.includes(log.type);
};

export const doesJobStatusHaveErrorType = (job: ReadMQTTJob) => {
  return MQTT_JOB_STATUS_ERROR_TYPES.includes(job.status);
};

export const doesJobStatusHaveSuccessType = (job: ReadMQTTJob) => {
  return MQTT_JOB_STATUS_SUCCESS_TYPES.includes(job.status);
};

export const doesJobStatusHaveNeutralType = (job: ReadMQTTJob) => {
  return MQTT_JOB_STATUS_NEUTRAL_TYPES.includes(job.status);
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

type StatusChangeBucket = {
  startTime: number;
  endTime: number;
  isUp: boolean;
};

export const getStatusChangeBuckets = (logs?: ReadMQTTJobLog[]) => {
  if (!logs || logs.length === 0) {
    return [];
  }

  const buckets: StatusChangeBucket[] = [
    {
      startTime: logs[0].createdTime,
      endTime: Number.MAX_SAFE_INTEGER,
      isUp: doesLogHaveSuccessType(logs[0]),
    },
  ];

  logs.slice(1).forEach((log, index) => {
    const prevItem = logs[index];
    buckets.push({
      startTime: log.createdTime,
      endTime: prevItem.createdTime,
      isUp: doesLogHaveSuccessType(log),
    });
  });

  return buckets;
};

const getIntervalInMs = (interval: AggregationInterval): number => {
  switch (interval) {
    case 'daily':
      return DAY_IN_MS;
    case 'hourly':
      return HOUR_IN_MS;
  }
};

export const getEndOfCurrentInterval = (
  interval: AggregationInterval
): number => {
  const now = new Date();
  const date = new Date(now.getTime() + getIntervalInMs(interval));

  date.setMilliseconds(0);
  date.setSeconds(0);
  date.setMinutes(0);

  if (interval === 'daily') {
    date.setHours(0);
  }

  return date.getTime();
};

export type UptimeAggregation = {
  startTime: number;
  endTime: number;
  uptimePercentage: number;
};

export const getUptimeAggregations = (
  logs: ReadMQTTJobLog[] = [],
  interval: AggregationInterval,
  intervalCount: number
): UptimeAggregation[] => {
  if (logs.length === 0) {
    return [];
  }

  const buckets = getStatusChangeBuckets(logs);
  const intervalInMs = getIntervalInMs(interval);

  const endOfCurrentInterval = getEndOfCurrentInterval(interval);
  const now = new Date().getTime();

  const firstLogTime = buckets[buckets.length - 1].startTime;

  const aggregations: UptimeAggregation[] = Array(intervalCount)
    .fill(0)
    .map((_, index) => {
      const endTime =
        index === 0 ? now : endOfCurrentInterval - index * intervalInMs;
      const startTime = endTime - intervalInMs;

      if (endTime <= firstLogTime) {
        return {
          endTime,
          startTime,
          uptimePercentage: -1,
        };
      }

      const bucketsForCurrentInterval = buckets.filter(
        ({ startTime: bucketStartTime, endTime: bucketEndTime }) => {
          return (
            bucketStartTime <= endTime &&
            bucketEndTime > Math.max(startTime, firstLogTime)
          );
        }
      );

      let uptime = bucketsForCurrentInterval.reduce((acc, cur) => {
        if (cur.isUp) {
          const uptimeInCurrentInterval =
            Math.min(endTime, cur.endTime) - Math.max(startTime, cur.startTime);
          return uptimeInCurrentInterval + acc;
        }
        return acc;
      }, 0);

      return {
        endTime,
        startTime,
        uptimePercentage:
          (uptime / (endTime - Math.max(startTime, firstLogTime))) * 100,
      };
    });

  return aggregations;
};
