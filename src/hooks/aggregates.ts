import { useSDK } from '@cognite/sdk-provider';
import { CogniteError } from '@cognite/sdk';
import { QueryKey, useQuery, UseQueryOptions } from '@tanstack/react-query';
import { PropertyAggregate } from 'common/types';

import { Filter, SourceType, TargetType } from 'types/api';

type T = SourceType | TargetType;

const AGGREGATE_BASE_KEY = ['aggregate'];

export const aggregatePropertyQueryKey = (t: T): QueryKey => [
  ...AGGREGATE_BASE_KEY,
  t,
  'properties',
];

const topLevelProperties: Record<T, string[]> = {
  assets: ['name', 'description', 'source'],
  timeseries: ['name', 'description', 'unit'],
  events: ['type', 'subtype', 'description', 'source'],
};

export const useAggregateProperties = (
  api: T,
  options?: UseQueryOptions<PropertyAggregate[], CogniteError>
) => {
  const sdk = useSDK();
  return useQuery(
    aggregatePropertyQueryKey(api),
    () => {
      return sdk
        .post<{
          items: PropertyAggregate[];
        }>(`/api/v1/projects/${sdk.project}/${api}/aggregate`, {
          headers: {
            'cdf-version': 'alpha',
          },
          data: { aggregate: 'uniqueProperties', path: ['metadata'] },
        })
        .then((r) => {
          if (r.status === 200) {
            return [
              ...topLevelProperties[api].map((v) => ({
                values: [{ property: [v] }],
              })),
              ...r.data.items,
            ];
          } else {
            return Promise.reject(r);
          }
        });
    },
    options
  );
};

type AggregateParams = {
  type: T;
  filter: Filter;
  advancedFilter?: any;
};
const aggregateQueryKey = ({
  type,
  filter,
  advancedFilter,
}: AggregateParams): QueryKey => [
  ...AGGREGATE_BASE_KEY,
  type,
  filter,
  advancedFilter,
];

export const useAggregate = (
  params: AggregateParams,
  options?: UseQueryOptions<number | undefined, CogniteError>
) => {
  const sdk = useSDK();
  return useQuery(
    aggregateQueryKey(params),
    () => {
      return sdk
        .post<{ items: { count: number }[] }>(
          `/api/v1/projects/${sdk.project}/${params.type}/aggregate`,
          {
            headers: {
              'cdf-version': 'alpha',
            },
            data: {
              filter: params.filter,
              advancedFilter: params.advancedFilter,
            },
          }
        )
        .then((r) => {
          if (r.status === 200) {
            return r.data.items[0]?.count;
          } else {
            return Promise.reject(r);
          }
        });
    },
    options
  );
};
