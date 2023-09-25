import {
  QueryClient,
  UseMutationOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import { getProject } from '@cognite/cdf-utilities';
import { CogniteClient } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';

import { CreateSessionVariables, useCreateSession } from './sessions';

type UpdateWithExternalId<T, P extends keyof T> = {
  externalId: string;
  update: {
    [K in keyof Pick<T, P>]?: { set: T[P] } | { setNull: true };
  };
};

// SOURCES

export type MQTTSourceType = 'mqtt3' | 'mqtt5';

export type BaseMQTTSource = {
  externalId: string;
  type: MQTTSourceType;
  host: string;
  port?: string;
  username?: string;
  useTls?: boolean;
};

export type ReadMQTTSource = BaseMQTTSource & {
  createdTime: number;
  lastUpdatedTime: number;
};

export type CreateMQTTSource = BaseMQTTSource & {
  password?: string;
};

export type EditMQTTSource = Required<Pick<BaseMQTTSource, 'externalId'>> &
  Partial<Omit<BaseMQTTSource, 'externalId' | 'type'>> & {
    password?: string;
  };

export type MQTTSourceWithJobMetrics = ReadMQTTSource & {
  jobs: MQTTJobWithMetrics[];
  throughput: number;
};

const getMQTTSourcesQueryKey = () => ['mqtt', 'source', 'list'];

const getMQTTSources = (sdk: CogniteClient) => {
  return sdk
    .get<{ items: ReadMQTTSource[] }>(
      `/api/v1/projects/${getProject()}/pluto/sources`,
      {
        headers: { 'cdf-version': 'alpha' },
      }
    )
    .then((r) => r.data.items);
};

const fetchMQTTSources = (sdk: CogniteClient, queryClient: QueryClient) => {
  return queryClient.fetchQuery(getMQTTSourcesQueryKey(), () =>
    getMQTTSources(sdk)
  );
};

export const useMQTTSources = () => {
  const sdk = useSDK();
  return useQuery(getMQTTSourcesQueryKey(), async () => {
    return getMQTTSources(sdk);
  });
};

const getMQTTSourcesWithMetricsQueryKey = () => [
  ...getMQTTSourcesQueryKey(),
  'with-metrics',
];

export const useMQTTSourcesWithJobMetrics = () => {
  const sdk = useSDK();
  const queryClient = useQueryClient();

  return useQuery(getMQTTSourcesWithMetricsQueryKey(), async () => {
    const sources = await fetchMQTTSources(sdk, queryClient);
    const jobsWithMetrics = await fetchMQTTJobsWithMetrics(sdk, queryClient);

    const sourcesWithJobMetrics: Record<string, MQTTSourceWithJobMetrics> = {};

    sources.forEach((source) => {
      sourcesWithJobMetrics[source.externalId] = {
        ...source,
        jobs: [],
        throughput: 0,
      };
    });

    Object.values(jobsWithMetrics).forEach((jobWithMetrics) => {
      if (sourcesWithJobMetrics[jobWithMetrics.sourceId]) {
        sourcesWithJobMetrics[jobWithMetrics.sourceId].jobs.push(
          jobWithMetrics
        );
      }
    });

    const raw = Object.values(sourcesWithJobMetrics);
    const withThroughput = raw.map((sourceWithMetrics) => {
      const total = sourceWithMetrics.jobs.reduce(
        (acc, cur) => acc + cur.throughput,
        0
      );

      return { ...sourceWithMetrics, throughput: total };
    });

    return withThroughput;
  });
};

const getMQTTSourceQueryKey = (externalId?: string) => [
  'mqtt',
  'source',
  'details',
  ...(externalId ? [externalId] : []),
];

const getMQTTSource = (sdk: CogniteClient, externalId?: string) => {
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
};

const fetchMQTTSource = (
  sdk: CogniteClient,
  queryClient: QueryClient,
  externalId?: string
) => {
  return queryClient.fetchQuery(getMQTTSourceQueryKey(), () =>
    getMQTTSource(sdk, externalId)
  );
};

export const useMQTTSource = (externalId?: string) => {
  const sdk = useSDK();

  return useQuery(getMQTTSourceQueryKey(externalId), async () => {
    return getMQTTSource(sdk, externalId);
  });
};

const getMQTTSourceWithMetricsQueryKey = (externalId?: string) => [
  ...getMQTTSourceQueryKey(externalId),
  'with-metrics',
];

export const useMQTTSourceWithMetrics = (externalId?: string) => {
  const sdk = useSDK();
  const queryClient = useQueryClient();

  return useQuery<MQTTSourceWithJobMetrics>(
    getMQTTSourceWithMetricsQueryKey(externalId),
    async () => {
      const source = await fetchMQTTSource(sdk, queryClient, externalId);
      const jobs = await fetchMQTTJobsWithMetrics(sdk, queryClient, externalId);
      const throughput = jobs.reduce((acc, cur) => acc + cur.throughput, 0);

      return {
        ...source,
        jobs,
        throughput,
      };
    }
  );
};

type CreateMQTTSourceVariables = CreateMQTTSource;

export const useCreateMQTTSource = (
  options?: UseMutationOptions<unknown, unknown, CreateMQTTSourceVariables>
) => {
  const sdk = useSDK();
  const queryClient = useQueryClient();

  return useMutation(
    async (source: CreateMQTTSourceVariables) => {
      return sdk
        .post<{ items: ReadMQTTSource[] }>(
          `/api/v1/projects/${getProject()}/pluto/sources`,
          {
            headers: { 'cdf-version': 'alpha' },
            data: {
              items: [source],
            },
          }
        )
        .then((r) => r.data.items[0]);
    },
    {
      ...options,
      onSuccess: (data, variables, context) => {
        queryClient.invalidateQueries(getMQTTSourcesQueryKey());
        options?.onSuccess?.(data, variables, context);
      },
    }
  );
};

type EditMQTTSourceVariables = {
  externalId: EditMQTTSource['externalId'];
  type: MQTTSourceType;
  update: { [key: string]: { set: unknown } | { setNull: true } };
};

export const useEditMQTTSource = (
  options?: UseMutationOptions<unknown, unknown, EditMQTTSourceVariables>
) => {
  const sdk = useSDK();
  const queryClient = useQueryClient();

  return useMutation(
    async (variables: EditMQTTSourceVariables) => {
      return sdk
        .post<{ items: ReadMQTTSource[] }>(
          `/api/v1/projects/${getProject()}/pluto/sources/update`,
          {
            headers: { 'cdf-version': 'alpha' },
            data: {
              items: [
                {
                  externalId: variables.externalId,
                  type: variables.type,
                  update: variables.update,
                },
              ],
            },
          }
        )
        .then((r) => r.data.items[0]);
    },
    {
      ...options,
      onSuccess: (data, variables, context) => {
        queryClient.invalidateQueries(getMQTTSourcesQueryKey());
        queryClient.invalidateQueries(getMQTTSourceQueryKey());
        options?.onSuccess?.(data, variables, context);
      },
    }
  );
};

type DeleteMQTTSourceVariables = {
  externalId: string;
};

export const useDeleteMQTTSource = (
  options?: UseMutationOptions<unknown, unknown, DeleteMQTTSourceVariables>
) => {
  const sdk = useSDK();
  const queryClient = useQueryClient();

  return useMutation(
    async (variables: DeleteMQTTSourceVariables) => {
      return sdk.post(`/api/v1/projects/${getProject()}/pluto/sources/delete`, {
        headers: { 'cdf-version': 'alpha' },
        data: {
          items: [
            {
              externalId: variables.externalId,
            },
          ],
        },
      });
    },
    {
      ...options,
      onSuccess: (data, variables, context) => {
        queryClient.invalidateQueries(
          getMQTTSourceQueryKey(variables.externalId)
        );
        queryClient.invalidateQueries(getMQTTSourcesQueryKey());
        options?.onSuccess?.(data, variables, context);
      },
    }
  );
};

// DESTINATIONS

type BaseMQTTDestination = {
  externalId: string;
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

type MQTTSessionCredentials = {
  nonce: string;
};

type CreateMQTTDestination = BaseMQTTDestination & {
  credentials?: MQTTSessionCredentials;
};

type CreateMQTTDestinationVariables = Omit<
  CreateMQTTDestination,
  'credentials'
> & {
  credentials: CreateSessionVariables;
};

export const useCreateMQTTDestination = () => {
  const sdk = useSDK();

  const { mutateAsync: createSession } = useCreateSession();

  return useMutation(async (destination: CreateMQTTDestinationVariables) => {
    const session = await createSession(destination.credentials);

    return sdk
      .post<{ items: ReadMQTTDestination[] }>(
        `/api/v1/projects/${getProject()}/pluto/destinations`,
        {
          headers: { 'cdf-version': 'alpha' },
          data: {
            items: [
              {
                externalId: destination.externalId,
                credentials: {
                  nonce: session.nonce,
                },
              },
            ],
          },
        }
      )
      .then((r) => r.data.items[0]);
  });
};

// JOBS

type MQTTFormatPrefixConfig = {
  fromTopic?: boolean;
  prefix?: string;
};

export type MQTTFormat = {
  type: 'cognite' | 'siemens' | 'tmc' | 'rockwell' | 'value' | 'custom';
  prefix?: MQTTFormatPrefixConfig;
};

type MQTTJobStatus =
  | 'running'
  | 'paused'
  | 'shutting_down'
  | 'error' // TODO: remove
  | 'startup_error'
  | 'connection_error'
  | 'connected'
  | 'transform_error'
  | 'destination_error'
  | 'waiting';

type MQTTJobTargetStatus = 'running' | 'paused';

type MqttJobConfig = {
  topicFilter: string;
};

type BaseMQTTJob = {
  config: MqttJobConfig;
  externalId: string;
  format: MQTTFormat;
};

export type ReadMQTTJob = BaseMQTTJob & {
  createdTime: number;
  lastUpdatedTime: number;
  destinationId: string;
  sourceId: string;
  status?: MQTTJobStatus;
  targetStatus: MQTTJobTargetStatus;
};

const getMQTTJobsQueryKey = (sourceExternalId?: string) => [
  'mqtt',
  'jobs',
  'list',
  ...(sourceExternalId ? [sourceExternalId] : []),
];

const getMQTTJobs = async (sdk: CogniteClient, sourceExternalId?: string) => {
  return sdk
    .get<{ items: ReadMQTTJob[] }>(
      `/api/v1/projects/${getProject()}/pluto/jobs`,
      {
        headers: { 'cdf-version': 'alpha' },
        params: {
          source: sourceExternalId,
        },
      }
    )
    .then((r) => r.data.items);
};

export const useMQTTJobs = (sourceExternalId?: string) => {
  const sdk = useSDK();
  return useQuery(getMQTTJobsQueryKey(sourceExternalId), async () => {
    return getMQTTJobs(sdk, sourceExternalId);
  });
};

export type MQTTJobWithMetrics = ReadMQTTJob & {
  metrics: ReadMQTTJobMetric[];
  throughput: number;
};

const getMQTTJobsWithMetricsQueryKey = (sourceExternalId?: string) => [
  ...getMQTTJobsQueryKey(sourceExternalId),
  'with-metrics',
];

const getMQTTJobsWithMetrics = async (
  sdk: CogniteClient,
  sourceExternalId?: string
) => {
  const jobs = await getMQTTJobs(sdk, sourceExternalId);
  const metrics = await getMQTTJobMetrics(sdk, sourceExternalId);

  const jobsWithMetrics: Record<string, MQTTJobWithMetrics> = {};

  jobs.forEach((job) => {
    jobsWithMetrics[job.externalId] = {
      ...job,
      metrics: [],
      throughput: 0,
    };
  });

  metrics.forEach((metric) => {
    if (jobsWithMetrics[metric.jobExternalId]) {
      jobsWithMetrics[metric.jobExternalId].metrics.push(metric);
    }
  });

  const raw = Object.values(jobsWithMetrics);
  const withThroughput = raw.map((jobWithMetrics) => {
    const now = new Date().getTime();
    //only get the average over the last 6 hours
    const sixHoursAgoTimestamp = now - 1000 * 60 * 60 * 6;
    const jobsLastSixHours = jobWithMetrics.metrics.filter((metric) => {
      return metric.timestamp >= sixHoursAgoTimestamp;
    });
    const totalInput = jobsLastSixHours.reduce((acc, cur) => {
      return acc + cur.destinationInputValues;
    }, 0);
    const timeSinceFirstMetric = jobsLastSixHours.reduce((acc, cur) => {
      return Math.min(acc, cur.timestamp);
    }, now);
    const hoursSinceFirstMetric = (now - timeSinceFirstMetric) / 1000 / 60 / 60;
    const throughput = Math.round(totalInput / hoursSinceFirstMetric);
    return {
      ...jobWithMetrics,
      throughput,
    };
  });

  return withThroughput;
};

const fetchMQTTJobsWithMetrics = (
  sdk: CogniteClient,
  queryClient: QueryClient,
  sourceExternalId?: string
) => {
  return queryClient.fetchQuery(
    getMQTTJobsWithMetricsQueryKey(sourceExternalId),
    () => getMQTTJobsWithMetrics(sdk, sourceExternalId)
  );
};

export const useMQTTJobsWithMetrics = (sourceExternalId?: string) => {
  const sdk = useSDK();
  return useQuery(getMQTTJobsWithMetricsQueryKey(sourceExternalId), () =>
    getMQTTJobsWithMetrics(sdk, sourceExternalId)
  );
};

export type ReadMQTTJobMetric = {
  jobExternalId: string;
  timestamp: number;
  sourceMessages: number;
  destinationInputValues: number;
  destinationRequests: number;
  transformFailures: number;
  destinationWriteFailures: number;
  destinationSkippedValues: number;
  destinationFailedValues: number;
  destinationUploadedValues: number;
};

const getMQTTJobMetricsQueryKey = (sourceExternalId?: string) => [
  'mqtt',
  'jobs',
  'metrics',
  'list',
  ...(sourceExternalId ? [sourceExternalId] : []),
];

const getMQTTJobMetrics = (sdk: CogniteClient, sourceExternalId?: string) => {
  return sdk
    .get<{ items: ReadMQTTJobMetric[] }>(
      `/api/v1/projects/${getProject()}/pluto/jobs/metrics`,
      {
        headers: { 'cdf-version': 'alpha' },
        params: {
          source: sourceExternalId,
        },
      }
    )
    .then((r) => r.data.items);
};

export const useMQTTJobMetrics = (sourceExternalId?: string) => {
  const sdk = useSDK();

  return useQuery(getMQTTJobMetricsQueryKey(sourceExternalId), async () => {
    return getMQTTJobMetrics(sdk, sourceExternalId);
  });
};

type MQTTJobLogType =
  | 'startup_error'
  | 'error' // TODO: remove
  | 'ok'
  | 'debug' // TODO: remove
  | 'stopped' // TODO: remove
  | 'paused'
  | 'connection_error'
  | 'connected'
  | 'transform_error'
  | 'destination_error';

export type ReadMQTTJobLog = {
  createdTime: number;
  lastUpdatedTime: number;
  jobExternalId: string;
  message: string;
  type: MQTTJobLogType;
};

const getMQTTJobLogsQueryKey = (sourceExternalId?: string) => [
  'mqtt',
  'jobs',
  'logs',
  'list',
  ...(sourceExternalId ? [sourceExternalId] : []),
];

const getMQTTJobLogs = (sdk: CogniteClient, sourceExternalId?: string) => {
  return sdk
    .get<{ items: ReadMQTTJobLog[] }>(
      `/api/v1/projects/${getProject()}/pluto/jobs/logs`,
      {
        headers: { 'cdf-version': 'alpha' },
        params: {
          source: sourceExternalId,
        },
      }
    )
    .then((r) => r.data.items);
};

export const useMQTTJobLogs = (sourceExternalId?: string) => {
  const sdk = useSDK();

  return useQuery(getMQTTJobLogsQueryKey(sourceExternalId), async () => {
    return getMQTTJobLogs(sdk, sourceExternalId);
  });
};

export type CreateMQTTJob = BaseMQTTJob & {
  destinationId: string;
  sourceId: string;
};

type CreateMQTTJobVariables = CreateMQTTJob;

export const useCreateMQTTJob = (
  options?: UseMutationOptions<unknown, unknown, CreateMQTTJobVariables>
) => {
  const sdk = useSDK();
  const queryClient = useQueryClient();

  return useMutation(
    async (job: CreateMQTTJobVariables) => {
      return sdk.post(`/api/v1/projects/${getProject()}/pluto/jobs`, {
        headers: { 'cdf-version': 'alpha' },
        data: {
          items: [job],
        },
      });
    },
    {
      onSuccess: (data, variables, context) => {
        queryClient.invalidateQueries(getMQTTJobsQueryKey());
        queryClient.invalidateQueries(getMQTTSourceQueryKey());
        options?.onSuccess?.(data, variables, context);
      },
    }
  );
};

type UpdateMQTTJobVariables = UpdateWithExternalId<
  ReadMQTTJob,
  'targetStatus' | 'config'
>;

export const useUpdateMQTTJob = (
  options?: UseMutationOptions<unknown, unknown, UpdateMQTTJobVariables>
) => {
  const sdk = useSDK();
  const queryClient = useQueryClient();

  return useMutation(
    async (variables: UpdateMQTTJobVariables) => {
      return sdk.post(`/api/v1/projects/${getProject()}/pluto/jobs/update`, {
        headers: { 'cdf-version': 'alpha' },
        data: {
          items: [
            { externalId: variables.externalId, update: variables.update },
          ],
        },
      });
    },
    {
      onSuccess: (data, variables, context) => {
        queryClient.invalidateQueries(getMQTTJobsQueryKey());
        queryClient.invalidateQueries(getMQTTSourceQueryKey());
        options?.onSuccess?.(data, variables, context);
      },
    }
  );
};

type DeleteMQTTJobVariables = { externalId: string };

export const useDeleteMQTTJob = () => {
  const sdk = useSDK();
  const queryClient = useQueryClient();

  return useMutation(
    async (variables: DeleteMQTTJobVariables) => {
      return sdk.post(`/api/v1/projects/${getProject()}/pluto/jobs/delete`, {
        headers: { 'cdf-version': 'alpha' },
        data: {
          items: [{ externalId: variables.externalId }],
        },
      });
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(getMQTTJobsQueryKey());
        queryClient.invalidateQueries(getMQTTSourceQueryKey());
      },
    }
  );
};
