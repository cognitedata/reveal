import { getProject } from '@cognite/cdf-utilities';
import { useSDK } from '@cognite/sdk-provider';
import { useQuery } from 'react-query';

// SOURCES

export type MQTTSourceType = 'mqtt3' | 'mqtt5';

type BaseMQTTSource = {
  externalId: string;
  type: MQTTSourceType;
  host?: string;
  port?: string;
  username: string;
};

export type ReadMQTTSource = BaseMQTTSource & {
  createdTime: number;
  lastUpdatedTime: number;
};

const getMQTTSourcesQueryKey = () => ['mqtt', 'source', 'list'];

export const useMQTTSources = () => {
  const sdk = useSDK();
  return useQuery(getMQTTSourcesQueryKey(), async () => {
    return sdk
      .get<{ items: ReadMQTTSource[] }>(
        `/api/v1/projects/${getProject()}/pluto/sources`,
        {
          headers: { 'cdf-version': 'alpha' },
        }
      )
      .then((r) => r.data.items);
  });
};

const getMQTTSourceQueryKey = (externalId?: string) => [
  'mqtt',
  'source',
  'details',
  externalId,
];

export const useMQTTSource = (externalId?: string) => {
  const sdk = useSDK();

  return useQuery(getMQTTSourceQueryKey(externalId), async () => {
    if (!externalId) {
      throw Error('external id is missing');
    }

    return sdk
      .post<{ items: ReadMQTTSource[] }>(
        `/api/v1/projects/${getProject()}/pluto/sources/byIds`,
        {
          headers: { 'cdf-version': 'alpha' },
          data: {
            items: [{ externalId }],
          },
        }
      )
      .then((r) => r.data.items[0]);
  });
};

// DESTINATIONS

export type MQTTDestinationType = 'datapoints' | 'events' | 'raw';

type BaseMQTTDestination = {
  externalId: string;
  type: MQTTDestinationType;
};

type ReadMQTTDestination = BaseMQTTDestination & {
  sessionId?: number;
  createdTime: number;
  lastUpdatedTime: number;
};

const getMQTTDestinationsQueryKey = () => ['mqtt', 'destination', 'list'];

export const useMQTTDestinations = () => {
  const sdk = useSDK();
  return useQuery(getMQTTDestinationsQueryKey(), async () => {
    return sdk
      .get<{ items: ReadMQTTDestination[] }>(
        `/api/v1/projects/${getProject()}/pluto/destinations`,
        {
          headers: { 'cdf-version': 'alpha' },
        }
      )
      .then((r) => r.data.items);
  });
};

// JOBS

type MQTTFormatPrefixConfig = {
  fromTopic?: boolean;
  prefix?: string;
};

type MQTTFormat = {
  type: 'cognite';
  prefix?: MQTTFormatPrefixConfig;
};

type BaseMQTTJob = {
  externalId: string;
  topicFilter: string;
  format: MQTTFormat;
};

export type ReadMQTTJob = BaseMQTTJob & {
  createdTime: number;
  lastUpdatedTime: number;
};

const getMQTTJobsQueryKey = () => ['mqtt', 'jobs', 'list'];

export const useMQTTJobs = () => {
  const sdk = useSDK();
  return useQuery(getMQTTJobsQueryKey(), async () => {
    return sdk
      .get<{ items: ReadMQTTJob[] }>(
        `/api/v1/projects/${getProject()}/pluto/jobs`,
        {
          headers: { 'cdf-version': 'alpha' },
        }
      )
      .then((r) => r.data.items);
  });
};

const getMQTTJobMetricsQueryKey = () => ['mqtt', 'jobs', 'metrics', 'list'];

export const useMQTTJobMetrics = () => {
  const sdk = useSDK();

  return useQuery(getMQTTJobMetricsQueryKey(), async () => {
    return sdk
      .get(`/api/v1/projects/${getProject()}/pluto/jobs/metrics`, {
        headers: { 'cdf-version': 'alpha' },
      })
      .then((r) => r.data.items);
  });
};
