import omit from 'lodash/omit';
import {
  useInfiniteQuery,
  UseInfiniteQueryResult,
  useMutation,
  useQueryClient,
} from 'react-query';
import { createRun, getFilteredRuns } from 'utils/RunsAPI';

import {
  CreateRunRequest,
  RunApi,
  RunsAPIResponse,
  RunStatus,
} from 'model/Runs';
import { Range } from '@cognite/cogs.js';
import { useEffect } from 'react';
import { useSDK } from '@cognite/sdk-provider';
import { DEFAULT_RUN_LIMIT } from 'utils/constants';

export const getRunsKey = (params: CreateRunFilterParam) => [
  'runs',
  params.externalId,
  omit(params, ['externalId']),
];

export const useRuns = (
  params: CreateRunFilterParam,
  options?: { enabled: boolean }
) => {
  const sdk = useSDK();
  const data = createRunsFilter(params);
  return useInfiniteQuery<
    RunsAPIResponse,
    Error & { status: number },
    { items: RunApi[] }
  >(
    getRunsKey(params),
    ({ pageParam }) => {
      return getFilteredRuns(sdk, {
        ...data,
        cursor: pageParam,
      });
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      ...options,
    }
  );
};

export const useAllRuns = (params: Omit<CreateRunFilterParam, 'limit'>) => {
  const q = useRuns({ ...params, limit: 1000 });

  useEffect(() => {
    if (q.hasNextPage && !q.isFetchingNextPage) {
      q.fetchNextPage();
    }
  }, [q]);

  return q as Omit<
    UseInfiniteQueryResult<{ items: RunApi[] }, Error & { status: number }>,
    'fetchNextPage'
  >;
};

type CreateRunFilterParam = {
  externalId: string;
  nextCursor?: string;
  search?: string;
  dateRange?: Range;
  statuses?: RunStatus[];
  limit?: number;
};
export const createRunsFilter = ({
  externalId,
  dateRange,
  statuses,
  search,
  limit = DEFAULT_RUN_LIMIT,
  nextCursor,
}: CreateRunFilterParam) => {
  return {
    filter: {
      externalId,
      ...(dateRange?.endDate && dateRange?.startDate
        ? {
            createdTime: {
              max: dateRange.endDate.getTime(),
              min: dateRange.startDate.getTime(),
            },
          }
        : {}),
      ...(statuses && statuses?.length > 0 && { statuses }),
      ...(search && {
        message: {
          substring: search,
        },
      }),
    },
    limit,
    cursor: nextCursor,
  };
};

export const useCreateRuns = () => {
  const sdk = useSDK();
  const client = useQueryClient();
  return useMutation({
    mutationFn: (runs: CreateRunRequest[]) => {
      return createRun(sdk, runs);
    },
    onSuccess() {
      client.invalidateQueries(['runs']);
    },
  });
};
