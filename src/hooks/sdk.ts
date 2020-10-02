import {
  useQuery,
  QueryConfig,
  InfiniteQueryConfig,
  useInfiniteQuery,
} from 'react-query';
import { AggregateResponse } from 'cognite-sdk-v3';
import { useContext } from 'react';
import { SdkContext } from 'context/sdk';

export type SdkResourceType =
  | 'assets'
  | 'timeseries'
  | 'sequences'
  | 'files'
  | 'events';
export const sdkResourceTypes: SdkResourceType[] = [
  'assets',
  'files',
  'events',
  'sequences',
  'timeseries',
];

type Error = { message?: string };
export const useAggregate = <T extends AggregateResponse>(
  type: SdkResourceType,
  filter: any,
  config?: QueryConfig<T, Error>
) => {
  const sdk = useContext(SdkContext)!;

  return useQuery<T, Error>(
    ['cdf', type, 'aggregate', filter],
    () =>
      sdk
        .post(`/api/v1/projects/${sdk.project}/${type}/aggregate`, {
          data: { filter },
        })
        .then(r => r.data?.items[0]),
    config
  );
};

export const useCdfItem = <T>(
  type: SdkResourceType,
  id: number,
  config?: QueryConfig<T, Error>
) => {
  const sdk = useContext(SdkContext)!;

  return useQuery<T, Error>(
    ['cdf', 'get', type, 'retrieve', id],
    () =>
      sdk
        .get(`/api/v1/projects/${sdk.project}/${type}/${id}`)
        .then(r => r.data),
    config
  );
};

export const useList = <T>(
  type: SdkResourceType,
  limit: number = 100,
  filter?: any,
  config?: QueryConfig<T[]>
) => {
  const sdk = useContext(SdkContext)!;

  return useQuery<T[]>(
    ['cdf', type, 'list', filter],
    () =>
      sdk
        .post(`/api/v1/projects/${sdk.project}/${type}/list`, {
          data: {
            limit,
            filter,
          },
        })
        .then(r => r.data?.items),
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
      sdk
        .post(`/api/v1/projects/${sdk.project}/${type}/search`, {
          data: {
            limit,
            search: { query },
            filter,
          },
        })
        .then(r => r.data?.items),
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
      sdk
        .post(`/api/v1/projects/${sdk.project}/${resourceType}/list`, {
          data: {
            limit,
            filter: resourceFilter,
            cursor: nextCursor,
          },
        })
        .then(r => r.data),
    { getFetchMore: r => r?.nextCursor, ...config }
  );
};
