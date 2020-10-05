import {
  useQuery,
  QueryConfig,
  InfiniteQueryConfig,
  useInfiniteQuery,
  QueryKey,
  useQueryCache,
} from 'react-query';
import {
  AggregateResponse,
  CogniteClient,
  DataSet,
  IdEither,
} from 'cognite-sdk-v3';
import { useContext } from 'react';
import { SdkContext } from 'context/sdk';

const get = (sdk: CogniteClient, path: string) =>
  sdk
    .get(`/api/v1/projects/${sdk.project}${path}`)
    .then(response => response.data);
const post = (sdk: CogniteClient, path: string, data: any) =>
  sdk
    .post(`/api/v1/projects/${sdk.project}${path}`, { data })
    .then(response => response.data);

export type SdkResourceType =
  | 'assets'
  | 'timeseries'
  | 'sequences'
  | 'files'
  | 'events'
  | 'datasets';

const aggregateKey = (type: SdkResourceType, filter: any) => [
  'cdf',
  type,
  'aggregate',
  filter,
];

// The aggregate APIs are a bit strange, filtering on irrelevant data
// set ids results in { items: [{ count: 0 }]} and invalid data set
// ids results in { items: [] }.
const aggregate = (
  sdk: CogniteClient,
  type: SdkResourceType,
  filter: any
): Promise<AggregateResponse> =>
  post(sdk, `/${type}/aggregate`, { filter }).then(
    data => data?.items[0] || { count: 0 }
  );

type Error = { message?: string };
export const useAggregate = (
  type: SdkResourceType,
  filter: any,
  config?: QueryConfig<AggregateResponse, Error>
) => {
  const sdk = useContext(SdkContext)!;

  return useQuery<AggregateResponse, Error>(
    aggregateKey(type, filter),
    () => aggregate(sdk, type, filter),
    config
  );
};

const retrieveKey = (type: SdkResourceType, id: number) => [
  'cdf',
  'get',
  type,
  'retrieve',
  id,
];
export const useCdfItem = <T>(
  type: SdkResourceType,
  id: number,
  config?: QueryConfig<T, Error>
) => {
  const sdk = useContext(SdkContext)!;

  return useQuery<T, Error>(
    retrieveKey(type, id),
    () => get(sdk, `/${type}/${id}`),
    config
  );
};

export const useCdfItems = <T>(
  type: SdkResourceType,
  ids: IdEither[],
  config?: QueryConfig<T[], Error>
) => {
  const sdk = useContext(SdkContext)!;

  return useQuery<T[], Error>(
    ['cdf', 'get', type, 'byIds', ids],
    () => post(sdk, `/${type}/byIds`, { items: ids }),
    config
  );
};
const listKey = (type: SdkResourceType, filter: any, limit: number) => [
  'cdf',
  type,
  'list',
  filter,
  limit,
];
const listApi = (
  sdk: CogniteClient,
  type: SdkResourceType,
  limit: number,
  filter: any
) =>
  post(
    sdk,
    `/${type}/list`,
    filter
      ? {
          limit,
          filter,
        }
      : { limit }
  ).then(data => data?.items);

export const useList = <T>(
  type: SdkResourceType,
  limit: number = 100,
  filter?: any,
  config?: QueryConfig<T[]>
) => {
  const sdk = useContext(SdkContext)!;

  return useQuery<T[]>(
    listKey(type, filter, limit),
    () => listApi(sdk, type, limit, filter),
    config
  );
};

export const useSearch = <T>(
  type: SdkResourceType,
  query: string,
  limit: number = 100,
  filter?: any,
  config?: QueryConfig<T[]>
) => {
  const sdk = useContext(SdkContext)!;

  return useQuery<T[]>(
    ['cdf', type, 'search', query, filter],
    () =>
      post(sdk, `/${type}/search`, {
        limit,
        search: { query },
        filter,
      }).then(data => data?.items),
    config
  );
};

export const useInfiniteList = <T>(
  type: SdkResourceType,
  limit: number = 100,
  filter?: any,
  config?: InfiniteQueryConfig<{ items: T[]; nextCursor?: string }>
) => {
  const sdk = useContext(SdkContext)!;

  return useInfiniteQuery<{ items: T[]; nextCursor?: string }>(
    ['cdf', type, 'infinite-list', filter],
    (
      _: string,
      resourceType: string,
      __: string,
      resourceFilter: any,
      nextCursor?: string
    ) =>
      post(sdk, `/${resourceType}/list`, {
        limit,
        filter: resourceFilter,
        cursor: nextCursor,
      }),
    { getFetchMore: r => r?.nextCursor, ...config }
  );
};

export interface DataSetWCount extends DataSet {
  count: number;
}
export const useRelevantDatasets = (
  type: SdkResourceType
): DataSetWCount[] | undefined => {
  const cache = useQueryCache();
  const sdk = useContext(SdkContext)!;
  const {
    data,
    isFetching: dataSetsFetching,
    isFetched: dataSetsFetched,
    fetchMore,
    canFetchMore,
  } = useInfiniteList<DataSet>('datasets', 1000);

  if (canFetchMore && !dataSetsFetching) {
    fetchMore();
  }

  const datasets =
    data
      ?.reduce((accl, { items }) => accl.concat(items), [] as DataSet[])
      .sort((a, b) => a.id - b.id) || [];

  const { data: counts, isFetched: aggregateFetched } = useQuery<
    DataSetWCount[]
  >(
    ['dataset-counts', type, datasets?.map(d => d.id)],
    (_: QueryKey, t, dataSetIds: number[]) =>
      Promise.all(
        dataSetIds.map(async (id, index) => {
          const filter = { dataSetIds: [{ id }] };
          const { count } = await cache.fetchQuery(
            aggregateKey(t, filter),
            () => aggregate(sdk, t, filter),
            {
              staleTime: 60 * 1000,
            }
          );
          return {
            ...datasets![index],
            count,
          };
        })
      ),
    {
      enabled: dataSetsFetched && datasets && datasets?.length > 0,
    }
  );

  if (aggregateFetched && counts) {
    return counts
      .filter(({ count }) => count > 0)
      .sort((a, b) => b.count - a.count);
  }
  return undefined;
};
