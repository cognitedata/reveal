import {
  InfiniteQueryConfig,
  QueryConfig,
  QueryKey,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryCache,
} from 'react-query';
import {
  AggregateResponse,
  CogniteClient,
  DataSet,
  IdEither,
} from '@cognite/sdk';
import { useSDK } from 'context/sdk';

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
  | 'datasets'
  | 'labels';

export const aggregateKey = (type: SdkResourceType, filter: any) => [
  'cdf',
  type,
  'aggregate',
  filter,
];

// The aggregate APIs are a bit strange, filtering on irrelevant data
// set ids results in { items: [{ count: 0 }]} and invalid data set
// ids results in { items: [] }.
export const aggregate = (
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
  const sdk = useSDK();

  return useQuery<AggregateResponse, Error>(
    aggregateKey(type, filter),
    () => aggregate(sdk, type, filter),
    config
  );
};

const byIdKey = (type: SdkResourceType, id: IdEither) => [
  'cdf',
  'get',
  type,
  'byIds',
  id,
];

export const useCdfItem = <T>(
  type: SdkResourceType,
  id: IdEither,
  config?: QueryConfig<T, Error>
) => {
  const sdk = useSDK();
  const ids = [id];
  return useQuery<T, Error>(
    byIdKey(type, id),
    () => post(sdk, `/${type}/byids`, { items: ids }).then(d => d?.items[0]),
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
  const sdk = useSDK();

  const sortedIds = ids
    .filter((i: any) => !!i.id || !!i.externalId)
    .sort((a: any, b: any) =>
      `${a?.id}${a?.externalId}`.localeCompare(`${b?.id}${b?.externalId}`)
    );

  return useQuery<T[], Error>(
    retrieveItemsKey(type, sortedIds),
    () => {
      if (sortedIds.length > 0) {
        return post(sdk, `/${type}/byids`, { items: sortedIds }).then(
          d => d?.items
        );
      }
      return [];
    },
    config
  );
};
export const listKey = (type: SdkResourceType, body: any) => [
  'cdf',
  type,
  'list',
  body,
];

export const listApi = (sdk: CogniteClient, type: SdkResourceType, body: any) =>
  post(sdk, `/${type}/list`, body).then(data => data?.items);

export const useList = <T>(
  type: SdkResourceType,
  body?: any,
  config?: QueryConfig<T[]>,
  noCleanUp = false
) => {
  const sdk = useSDK();

  const processedBody = noCleanUp ? body : cleanupBody(body);

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
const searchApi = <T>(
  sdk: CogniteClient,
  type: SdkResourceType,
  query: string,
  body?: any
): Promise<T[]> => {
  return post(sdk, `/${type}/search`, {
    ...body,
    search: getSearchArgs(type, query),
  }).then(r => r?.items);
};

export const useSearch = <T>(
  type: SdkResourceType,
  query: string,
  body?: any,
  config?: QueryConfig<T[]>
) => {
  const sdk = useSDK();
  const processedBody = cleanupBody(body);

  return useQuery<T[]>(
    ['cdf', type, 'search', query, processedBody],
    () => searchApi<T>(sdk, type, query, processedBody),
    config
  );
};

export const useInfiniteSearch = <T>(
  type: SdkResourceType,
  query: string,
  limit: number = 10,
  filter?: any,
  config?: InfiniteQueryConfig<T[]>
) => {
  const sdk = useSDK();

  return useInfiniteQuery<T[]>(
    ['cdf', type, 'infinite-search', query, filter],
    async (
      _: string,
      t: SdkResourceType,
      __: string,
      q: string,
      f?: any,
      offset?: number
    ) => {
      const offsetLimit = offset ? limit + offset : limit;
      const body = f
        ? { filter: f, limit: offsetLimit }
        : { limit: offsetLimit };
      const result = await searchApi<T>(sdk, t, q, body);

      if (offset) {
        return result.slice(offset, offset + limit);
      }
      return result;
    },
    {
      getFetchMore: (page, allPages) => {
        const itemCount = allPages.reduce((accl, p) => accl + p.length, 0);
        if (page.length === limit) {
          return itemCount;
        }
        return undefined;
      },
      ...config,
    }
  );
};

export const useInfiniteList = <T>(
  type: SdkResourceType,
  limit: number = 100,
  filter?: any,
  config?: InfiniteQueryConfig<{ items: T[]; nextCursor?: string }>
) => {
  const sdk = useSDK();

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

export const useCreate = (type: SdkResourceType, options?: any) => {
  const sdk = useSDK();

  return useMutation(
    (data: any | any[]) => {
      const items = Array.isArray(data) ? data : [data];
      return post(sdk, `/${type}`, { items });
    },
    {
      onSuccess: options?.onSuccess,
      onError: options?.onError,
      onMutate: options?.onMutate,
      onSettled: options?.onSettled,
    }
  );
};
export const useUpdate = (type: SdkResourceType, options?: any) => {
  const sdk = useSDK();

  return useMutation(
    (data: any | any[]) => {
      const items = Array.isArray(data) ? data : [data];
      return post(sdk, `/${type}/update`, { items });
    },
    {
      onSuccess: options?.onSuccess,
      onError: options?.onError,
      onMutate: options?.onMutate,
      onSettled: options?.onSettled,
    }
  );
};

export interface DataSetWCount extends DataSet {
  count: number;
}
export const useRelevantDatasets = (
  type: SdkResourceType
): DataSetWCount[] | undefined => {
  const cache = useQueryCache();
  const sdk = useSDK();
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
