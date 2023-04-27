import { ReadMQTTJobLog } from 'hooks/hostedExtractors';

const MQTT_JOB_LOG_ERROR_TYPES: ReadMQTTJobLog['type'][] = [
  'error',
  'startup_error',
];

export const getErrorCountInLast30Days = (logs?: ReadMQTTJobLog[]): number => {
  if (!logs) {
    return 0;
  }

  const now = new Date().getTime();
  const before = now - 1000 * 60 * 60 * 24 * 30;

  const logsInLast30Days = logs.filter(
    ({ createdTime }) => createdTime >= before
  );
  const count = logsInLast30Days.reduce(
    (acc, cur) => (MQTT_JOB_LOG_ERROR_TYPES.includes(cur.type) ? acc + 1 : acc),
    0
  );

  return count;
};
