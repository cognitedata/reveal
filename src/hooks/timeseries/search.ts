import { CogniteError, TimeseriesFilter } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';
import { QueryKey, useQuery, UseQueryOptions } from '@tanstack/react-query';
import { RawTimeseries, TS_BASE_QUERY_KEY } from '.';

const useTimeseriesSearchKey = (
  q: string,
  filter?: TimeseriesFilter
): QueryKey => [...TS_BASE_QUERY_KEY, 'search', q, { filter }];

export const useTimeseriesSearch = <T>(
  query: string,
  opts?: UseQueryOptions<RawTimeseries[], CogniteError, T>
) => {
  const sdk = useSDK();

  return useQuery(
    useTimeseriesSearchKey(query),
    () =>
      sdk
        .post<{ items: RawTimeseries[] }>(
          `/api/v1/projects/${sdk.project}/timeseries/search`,
          { data: { search: { query }, limit: 1000 } }
        )
        .then((r) => {
          if (r.status === 200) {
            return r.data.items;
          } else {
            return Promise.reject(r);
          }
        }),
    opts
  );
};
