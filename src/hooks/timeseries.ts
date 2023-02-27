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

const useTimeseriesKey = (
  limit: number,
  filter?: TimeseriesFilter
): QueryKey => ['timeseries', 'list', { limit, filter }];
const useTimeseriesSearhKey = (
  q: string,
  filter?: TimeseriesFilter
): QueryKey => ['timeseries', 'search', q, { filter }];

export const useTimeseries = (
  limit: number,
  filter?: TimeseriesFilter,
  opts?: UseInfiniteQueryOptions<
    { items: Timeseries[]; nextPage?: string },
    CogniteError
  >
) => {
  const sdk = useSDK();
  return useInfiniteQuery(
    useTimeseriesKey(limit, filter),
    ({ pageParam }) =>
      sdk.timeseries.list({ cursor: pageParam, filter, limit }),
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
    useTimeseriesSearhKey(query),
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
