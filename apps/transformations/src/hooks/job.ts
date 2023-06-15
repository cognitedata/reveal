import { useMemo } from 'react';

import {
  InfiniteData,
  useInfiniteQuery,
  UseInfiniteQueryOptions,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from '@tanstack/react-query';
import { JOB_LIST_REFETCH_INTERVAL_IN_MS } from '@transformations/common';
import { Job, SdkListData } from '@transformations/types';
import {
  BASE_QUERY_KEY,
  getTransformationsApiUrl,
  parseMetricName,
} from '@transformations/utils';

import { useSDK } from '@cognite/sdk-provider';

type JobListData = {
  items: Job[];
  nextCursor?: string | undefined;
};

export const getJobListQueryKey = (transformationId: number) => [
  BASE_QUERY_KEY,
  'job-list',
  transformationId,
];

export const getJobDetailsQueryKey = (jobId: number) => [
  BASE_QUERY_KEY,
  'job',
  jobId,
];

export const getJobMetricsQueryKey = (jobId: number) => [
  ...getJobDetailsQueryKey(jobId),
  'metrics',
];

export const useJobList = (
  transformationId?: number,
  options?: UseInfiniteQueryOptions<
    JobListData,
    unknown,
    JobListData,
    JobListData,
    (string | number)[]
  >
) => {
  const sdk = useSDK();

  return useInfiniteQuery<
    JobListData,
    unknown,
    JobListData,
    (string | number)[]
  >(
    getJobListQueryKey(transformationId as number),
    ({ pageParam = undefined }) =>
      sdk
        .get<JobListData>(getTransformationsApiUrl('/jobs'), {
          params: {
            limit: 100,
            transformationId,
            cursor: pageParam,
          },
        })
        .then(({ data }) => data),
    {
      getNextPageParam: (lastPage) => lastPage?.nextCursor,
      enabled: !!transformationId,
      refetchInterval: JOB_LIST_REFETCH_INTERVAL_IN_MS,
      ...options,
    }
  );
};

export const useJobDetails = (
  jobId: number,
  options?: UseQueryOptions<Job, unknown, Job>
) => {
  const sdk = useSDK();
  const queryClient = useQueryClient();

  return useQuery<Job, unknown, Job>(
    getJobDetailsQueryKey(jobId),
    () =>
      sdk
        .post<SdkListData<Job>>(getTransformationsApiUrl('/jobs/byids'), {
          data: {
            items: [
              {
                id: jobId,
              },
            ],
          },
        })
        .then(({ data }) => data?.items?.[0]),
    {
      ...options,
      onSuccess: (data) => {
        const jobListQueryData = queryClient.getQueryData(
          getJobListQueryKey(data.transformationId)
        );
        if (jobListQueryData) {
          queryClient.setQueryData<InfiniteData<JobListData>>(
            getJobListQueryKey(data.transformationId),
            (jobListData) => {
              return {
                ...jobListData,
                pageParams: jobListData?.pageParams ?? [],
                pages:
                  jobListData?.pages.map((page) => ({
                    ...page,
                    items: page.items.map((item) =>
                      item.id === data.id ? data : item
                    ),
                  })) ?? [],
              };
            }
          );
        }
      },
    }
  );
};

export type JobMetricsGroup = {
  action: string;
  count: number;
  label: string;
  metrics: JobMetric[];
  name: string;
  resource: string;
};

export const groupJobMetrics = (metrics?: JobMetric[]): JobMetricsGroup[] => {
  const map: { [name: string]: JobMetricsGroup } = {};

  metrics?.forEach((metric) => {
    const { count, name } = metric;
    const { action, label, resource } = parseMetricName(name);

    // we ignore the metric if we cannot parse the action or the resource
    // from the name
    if (!!action && !!resource) {
      if (map[name]) {
        map[name].metrics.push(metric);
        map[name].count = Math.max(map[name].count, count);
      } else {
        map[name] = {
          action,
          count,
          label,
          metrics: [metric],
          name: name,
          resource,
        };
      }
    }
  });

  const values = Object.values(map);

  // sorting array to put read entries to the beginning
  values.sort((a, b) => {
    if (
      (a.action === 'read' && b.action === 'read') ||
      (a.action !== 'read' && b.action !== 'read')
    ) {
      return 0;
    }
    if (a.action === 'read' && b.action !== 'read') {
      return -1;
    }
    return 1;
  });

  return values;
};

export const useGroupedJobMetrics = (
  id: number,
  options?: UseQueryOptions<JobMetric[], unknown, JobMetric[]>
) => {
  const { data: metrics, ...queryProps } = useJobMetrics(id, options);

  const groupedJobMetrics: JobMetricsGroup[] = useMemo(
    () => groupJobMetrics(metrics),
    [metrics]
  );

  return { data: groupedJobMetrics, ...queryProps };
};

export type JobMetric = {
  id: number;
  count: number;
  timestamp: number;
  name: string;
};

export const useJobMetrics = (
  id: number,
  options?: UseQueryOptions<JobMetric[], unknown, JobMetric[]>
) => {
  const sdk = useSDK();

  return useQuery<JobMetric[], unknown, JobMetric[]>(
    getJobMetricsQueryKey(id),
    () =>
      sdk
        .get<SdkListData<JobMetric>>(
          getTransformationsApiUrl(`/jobs/${id}/metrics`)
        )
        .then(({ data }) => data.items),
    options
  );
};
