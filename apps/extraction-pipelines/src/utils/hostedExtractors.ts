import { StatusProps } from '@cognite/cogs.js';
import {
  MQTTJobWithMetrics,
  ReadMQTTJob,
  ReadMQTTJobLog,
  ReadMQTTJobMetric,
} from 'hooks/hostedExtractors';

const MQTT_JOB_LOG_ERROR_TYPES: ReadMQTTJobLog['type'][] = [
  'error', // TODO: remove
  'startup_error',
  'connection_error',
  'transform_error',
  'destination_error',
];
const MQTT_JOB_LOG_SUCCESS_TYPES: ReadMQTTJobLog['type'][] = [
  'ok',
  'connected',
];

const MQTT_JOB_LOG_PAUSE_TYPES: ReadMQTTJobLog['type'][] = ['stopped'];

const MQTT_JOB_STATUS_ERROR_TYPES: ReadMQTTJob['status'][] = [
  'error', // TODO: remove
  'startup_error',
  'connection_error',
  'transform_error',
  'destination_error',
];
const MQTT_JOB_STATUS_SUCCESS_TYPES: ReadMQTTJob['status'][] = [
  'running',
  'connected',
];
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

export const doesLogHavePauseType = (log: ReadMQTTJobLog) => {
  return MQTT_JOB_LOG_PAUSE_TYPES.includes(log.type);
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

export const getJobStatusForCogs = (
  job: MQTTJobWithMetrics
): StatusProps['type'] | undefined => {
  if (doesJobStatusHaveErrorType(job)) {
    return 'critical';
  }
  if (doesJobStatusHaveNeutralType(job)) {
    return 'neutral';
  }
  if (doesJobStatusHaveSuccessType(job)) {
    return 'success';
  }
  return undefined;
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

export type MetricAggregation = {
  startTime: number;
  endTime: number;
  data?: Omit<ReadMQTTJobMetric, 'timestamp' | 'externalId'>;
};

export const getMetricAggregations = (
  metrics: ReadMQTTJobMetric[],
  interval: AggregationInterval,
  intervalCount: number
): MetricAggregation[] => {
  const intervalInMs = getIntervalInMs(interval);
  const endOfCurrentInterval = getEndOfCurrentInterval(interval);
  const now = new Date().getTime();

  const aggregations: MetricAggregation[] = Array(intervalCount)
    .fill(0)
    .map((_, index) => {
      const endTime =
        (index === 0 ? now : endOfCurrentInterval) - index * intervalInMs;
      const startTime =
        (index === 0 ? endOfCurrentInterval : endTime) - intervalInMs;

      const metricsForCurrentInterval = metrics.filter(
        ({ timestamp }) => timestamp < endTime && timestamp >= startTime
      );

      if (metricsForCurrentInterval.length === 0) {
        return {
          endTime,
          startTime,
          data: undefined,
        };
      }

      const data = { ...metricsForCurrentInterval[0] };

      metricsForCurrentInterval.slice(1).forEach((metric) => {
        data.destinationFailedValues += metric.destinationFailedValues;
        data.destinationInputValues += metric.destinationInputValues;
        data.destinationRequests += metric.destinationRequests;
        data.destinationSkippedValues += metric.destinationSkippedValues;
        data.destinationUploadedValues += metric.destinationUploadedValues;
        data.destinationWriteFailures += metric.destinationWriteFailures;
        data.transformFailures += metric.transformFailures;
        data.sourceMessages += metric.sourceMessages;
      });

      return {
        endTime,
        startTime,
        data,
      };
    });

  return aggregations;
};

export const getMetricAggregationSuccessCount = (
  data: MetricAggregation['data']
): number => {
  if (!data) {
    return 0;
  }

  return data.sourceMessages - data.transformFailures;
};

export const getMetricAggregationErrorCount = (
  data: MetricAggregation['data']
): number => {
  if (!data) {
    return 0;
  }

  return data.transformFailures;
};

export const getWriteDataAggregationSuccessCount = (
  data: MetricAggregation['data']
): number => {
  if (!data) {
    return 0;
  }

  return data.destinationUploadedValues;
};

export const getWriteFailureAggregationErrorCount = (
  data: MetricAggregation['data']
): number => {
  if (!data) {
    return 0;
  }

  return data.destinationWriteFailures;
};

type StatusChangeBucket = {
  startTime: number;
  endTime: number;
  isUp: boolean;
  log: ReadMQTTJobLog;
};

export const getStatusChangeBuckets = (logs?: ReadMQTTJobLog[]) => {
  if (!logs || logs.length === 0) {
    return [];
  }

  const buckets: StatusChangeBucket[] = [
    {
      startTime: logs[0].createdTime,
      endTime: Number.MAX_SAFE_INTEGER,
      isUp: doesLogHaveSuccessType(logs[0]) || doesLogHavePauseType(logs[0]),
      log: logs[0],
    },
  ];

  logs.slice(1).forEach((log, index) => {
    const prevItem = logs[index];
    buckets.push({
      startTime: log.createdTime,
      endTime: prevItem.createdTime,
      isUp: doesLogHaveSuccessType(log) || doesLogHavePauseType(log),
      log: log,
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
  logs: ReadMQTTJobLog[];
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
        (index === 0 ? now : endOfCurrentInterval) - index * intervalInMs;
      const startTime =
        (index === 0 ? endOfCurrentInterval : endTime) - intervalInMs;

      if (endTime <= firstLogTime) {
        return {
          endTime,
          startTime,
          uptimePercentage: -1,
          logs: [],
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

      let bucketedLogs: ReadMQTTJobLog[] = [];
      bucketsForCurrentInterval.forEach((bucket) => {
        bucketedLogs.push(bucket.log);
      });

      return {
        endTime,
        startTime,
        uptimePercentage:
          (uptime / (endTime - Math.max(startTime, firstLogTime))) * 100,
        logs: bucketedLogs,
      };
    });

  return aggregations;
};

export const formatUptime = (uptime: number): string => {
  const fixed = uptime.toFixed(2);
  return fixed === '100.00' && uptime !== 100 ? '99.99' : fixed;
};
