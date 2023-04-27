import { getProject } from '@cognite/cdf-utilities';
import { CogniteClient } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';
import {
  QueryClient,
  UseMutationOptions,
  useMutation,
  useQuery,
  useQueryClient,
} from 'react-query';
import { useCreateSession } from './sessions';

// SOURCES

export type MQTTSourceType = 'mqtt3' | 'mqtt5';

export type BaseMQTTSource = {
  externalId: string;
  type: MQTTSourceType;
  host: string;
  port?: string;
  username: string;
};

export type ReadMQTTSource = BaseMQTTSource & {
  createdTime: number;
  lastUpdatedTime: number;
};

export type CreateMQTTSource = BaseMQTTSource & {
  password: string;
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

      const jobsWithMetrics = await fetchMQTTJobsWithMetrics(sdk, queryClient);
      const jobsForSource = jobsWithMetrics.filter(
        ({ sourceId }) => sourceId === externalId
      );
      const throughput = jobsForSource.reduce(
        (acc, cur) => acc + cur.throughput,
        0
      );

      return {
        ...source,
        jobs: jobsForSource,
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
  clientId: string;
  clientSecret: string;
};

export const useCreateMQTTDestination = () => {
  const sdk = useSDK();

  const { mutateAsync: createSession } = useCreateSession();

  return useMutation(async (destination: CreateMQTTDestinationVariables) => {
    const session = await createSession({
      clientId: destination.clientId,
      clientSecret: destination.clientSecret,
    });

    return sdk
      .post<{ items: ReadMQTTDestination[] }>(
        `/api/v1/projects/${getProject()}/pluto/destinations`,
        {
          headers: { 'cdf-version': 'alpha' },
          data: {
            items: [
              {
                externalId: destination.externalId,
                type: destination.type,
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

type MQTTFormat = {
  type: 'cognite';
  prefix?: MQTTFormatPrefixConfig;
};

type MQTTJobStatus = 'running' | 'paused';

type BaseMQTTJob = {
  externalId: string;
  topicFilter: string;
  format: MQTTFormat;
};

export type ReadMQTTJob = BaseMQTTJob & {
  createdTime: number;
  lastUpdatedTime: number;
  destinationId: string;
  sourceId: string;
  status?: string;
  targetStatus: MQTTJobStatus;
};

const getMQTTJobsQueryKey = () => ['mqtt', 'jobs', 'list'];

const getMQTTJobs = async (sdk: CogniteClient) => {
  return sdk
    .get<{ items: ReadMQTTJob[] }>(
      `/api/v1/projects/${getProject()}/pluto/jobs`,
      {
        headers: { 'cdf-version': 'alpha' },
      }
    )
    .then((r) => r.data.items);
};

export const useMQTTJobs = () => {
  const sdk = useSDK();
  return useQuery(getMQTTJobsQueryKey(), async () => {
    return getMQTTJobs(sdk);
  });
};

export type MQTTJobWithMetrics = ReadMQTTJob & {
  metrics: ReadMQTTJobMetric[];
  throughput: number;
};

const getMQTTJobsWithMetricsQueryKey = () => [
  ...getMQTTJobsQueryKey(),
  'with-metrics',
];

const getMQTTJobsWithMetrics = async (sdk: CogniteClient) => {
  const jobs = await getMQTTJobs(sdk);
  const metrics = await getMQTTJobMetrics(sdk);

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
    const totalInput = jobWithMetrics.metrics.reduce((acc, cur) => {
      return acc + cur.destinationInputValues;
    }, 0);

    const now = new Date().getTime();
    const minTimestamp = jobWithMetrics.metrics.reduce((acc, cur) => {
      return Math.min(acc, cur.timestamp);
    }, now);

    const msDiff = now - minTimestamp;
    const hourDiff = Math.floor(msDiff / 1000 / 60 / 60) + 1;
    const throughput = Math.round(totalInput / hourDiff);

    return {
      ...jobWithMetrics,
      throughput,
    };
  });

  return withThroughput;
};

const fetchMQTTJobsWithMetrics = (
  sdk: CogniteClient,
  queryClient: QueryClient
) => {
  return queryClient.fetchQuery(getMQTTJobsWithMetricsQueryKey(), () =>
    getMQTTJobsWithMetrics(sdk)
  );
};

export const useMQTTJobsWithMetrics = () => {
  const sdk = useSDK();
  return useQuery(getMQTTJobsWithMetricsQueryKey(), () =>
    getMQTTJobsWithMetrics(sdk)
  );
};

type ReadMQTTJobMetric = {
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

const getMQTTJobMetricsQueryKey = () => ['mqtt', 'jobs', 'metrics', 'list'];

const getMQTTJobMetrics = (sdk: CogniteClient) => {
  return sdk
    .get<{ items: ReadMQTTJobMetric[] }>(
      `/api/v1/projects/${getProject()}/pluto/jobs/metrics`,
      {
        headers: { 'cdf-version': 'alpha' },
      }
    )
    .then((r) => r.data.items);
};

export const useMQTTJobMetrics = () => {
  const sdk = useSDK();

  return useQuery(getMQTTJobMetricsQueryKey(), async () => {
    return getMQTTJobMetrics(sdk);
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
