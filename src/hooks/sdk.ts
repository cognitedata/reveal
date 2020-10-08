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
} from '@cognite/sdk';
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

export const retrieveItemsKey = (type: SdkResourceType, ids: IdEither[]) => [
  'cdf',
  'get',
  type,
  'byIds',
  ids,
];

export const useCdfItems = <T>(
  type: SdkResourceType,
  ids: IdEither[],
  config?: QueryConfig<T[], Error>
) => {
  const sdk = useContext(SdkContext)!;

  const sortedIds = ids
    .filter((i: any) => !!i.id || !!i.externalId)
    .sort((a: any, b: any) =>
      `${a?.id}${a?.externalId}`.localeCompare(`${b?.id}${b?.externalId}`)
    );

  return useQuery<T[], Error>(
    retrieveItemsKey(type, sortedIds),
    () => post(sdk, `/${type}/byids`, { items: sortedIds }).then(d => d?.items),
    config
  );
};
export const listKey = (type: SdkResourceType, body: any) => [
  'cdf',
  type,
  'list',
  body,
];
const listApi = (sdk: CogniteClient, type: SdkResourceType, body: any) =>
  post(sdk, `/${type}/list`, body).then(data => data?.items);

export const useList = <T>(
  type: SdkResourceType,
  body?: any,
  config?: QueryConfig<T[]>
) => {
  const sdk = useContext(SdkContext)!;

  const processedBody = cleanupBody(body);

  return useQuery<T[]>(
    listKey(type, processedBody),
    () => listApi(sdk, type, processedBody),
    config
  );
};

const getSearchArgs = (type: SdkResourceType, query: string) => {
  switch (type) {
    case 'files':
      return { name: query };
    case 'events':
      return { description: query };
    default:
      return { query };
  }
};
const searchApi = (
  sdk: CogniteClient,
  type: SdkResourceType,
  query: string,
  filter?: any
) => {
  return post(sdk, `/${type}/search`, {
    ...filter,
    search: getSearchArgs(type, query),
  }).then(r => r?.items);
};

export const useSearch = <T>(
  type: SdkResourceType,
  query: string,
  body?: any,
  config?: QueryConfig<T[]>
) => {
  const sdk = useContext(SdkContext)!;
  const processedBody = cleanupBody(body);

  return useQuery<T[]>(
    ['cdf', type, 'search', query, processedBody],
    () => searchApi(sdk, type, query, processedBody),
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

const cleanupBody = (body?: any) => {
  let processedBody: any | undefined = { ...body };
  if (
    processedBody.filter &&
    typeof processedBody.filter === 'object' &&
    Object.keys(processedBody.filter).length === 0
  ) {
    // filter should always be non-empty
    delete processedBody.filter;
  }
  // body should always be non-empty
  if (Object.keys(processedBody).length === 0) {
    processedBody = undefined;
  }
  return processedBody;
};
