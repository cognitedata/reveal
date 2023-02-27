import {
  Timeseries,
  CogniteError,
  TimeseriesFilter,
  TimeSeriesUpdate,
} from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';
import {
  QueryKey,
  useInfiniteQuery,
  UseInfiniteQueryOptions,
  useMutation,
  UseMutationOptions,
  useQuery,
  UseQueryOptions,
} from '@tanstack/react-query';
import { TABLE_ITEMS_PER_PAGE } from '../constants';

type TSParams = {
  limit?: number;
  unmatchedOnly?: boolean;
  filter?: TimeseriesFilter;
};
const useTimeseriesKey = (opts: TSParams): QueryKey => [
  'timeseries',
  'list',
  opts,
];
const useTimeseriesSearchKey = (
  q: string,
  filter?: TimeseriesFilter
): QueryKey => ['timeseries', 'search', q, { filter }];

type RawTimeseries = Timeseries & {
  lastUpdatedTime: number;
  createdTime: number;
};

export const useTimeseries = (
  { limit = TABLE_ITEMS_PER_PAGE, unmatchedOnly: unmatched, filter }: TSParams,
  opts?: UseInfiniteQueryOptions<
    { items: RawTimeseries[]; nextPage?: string },
    CogniteError
  >
) => {
  const sdk = useSDK();
  return useInfiniteQuery(
    useTimeseriesKey({ limit, filter, unmatchedOnly: unmatched }),
    ({ pageParam }) =>
      sdk
        .post<{ items: RawTimeseries[]; nextPage?: string }>(
          `/api/v1/projects/${sdk.project}/timeseries/list`,
          {
            headers: {
              'cdf-version': 'alpha',
            },
            data: {
              cursor: pageParam,
              filter,
              advancedFilter: unmatched
                ? {
                    not: {
                      exists: {
                        property: ['assetId'],
                      },
                    },
                  }
                : undefined,
              limit,
            },
          }
        )
        .then((r) => {
          if (r.status === 200) {
            return r.data;
          } else {
            return Promise.reject(r);
          }
        }),
    {
      getNextPageParam(lastPage) {
        return lastPage.nextPage;
      },
      ...opts,
    }
  );
};

export const useTimeseriesSearch = <T>(
  query: string,
  opts?: UseQueryOptions<Timeseries[], CogniteError, T>
) => {
  const sdk = useSDK();
  return useQuery(
    useTimeseriesSearchKey(query),
    () => sdk.timeseries.search({ search: { query }, limit: 1000 }),

    opts
  );
};

export const useUpdateTimeseries = (
  options?: UseMutationOptions<Timeseries[], CogniteError, TimeSeriesUpdate[]>
) => {
  const sdk = useSDK();

  return useMutation(
    ['update', 'ts'],
    (changes) => {
      return sdk.timeseries.update(changes);
    },
    options
  );
};
