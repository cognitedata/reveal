import { useQuery, QueryConfig } from 'react-query';
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

export const useAggregate = <T extends AggregateResponse>(
  type: SdkResourceType,
  filter: any,
  config?: QueryConfig<T, unknown>
) => {
  const sdk = useContext(SdkContext)!;

  return useQuery<T>(
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
  config?: QueryConfig<T>
) => {
  const sdk = useContext(SdkContext)!;

  return useQuery<T>(
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
  config?: QueryConfig<T>
) => {
  const sdk = useContext(SdkContext)!;

  return useQuery<T>(
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
