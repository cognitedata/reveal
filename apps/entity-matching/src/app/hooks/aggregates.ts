import {
  FetchQueryOptions,
  QueryClient,
  QueryKey,
  useQuery,
  UseQueryOptions,
} from '@tanstack/react-query';

import { CogniteClient, CogniteError } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';

import { PropertyAggregate } from '../common/types';
import { API, Filter } from '../types/api';

type T = API | 'documents';

const AGGREGATE_BASE_KEY = ['aggregate'];

export const aggregatePropertyQueryKey = (t: T): QueryKey => [
  ...AGGREGATE_BASE_KEY,
  t,
  'properties',
];

const topLevelProperties: Record<T, string[]> = {
  assets: ['name', 'externalId', 'description', 'source'],
  timeseries: ['name', 'externalId', 'description', 'unit'],
  events: ['externalId', 'type', 'subtype', 'description', 'source'],
  files: ['name', 'externalId', 'directory', 'source', 'mimeType'],
  sequences: ['name', 'externalId', 'description'],
  threeD: ['name'],
  documents: ['title', 'mimeType', 'type'],
};

export const useAggregateProperties = (
  api: T,
  options?: UseQueryOptions<PropertyAggregate[], CogniteError>
) => {
  const sdk = useSDK();
  return useQuery(
    aggregatePropertyQueryKey(api),
    () => {
      if (api === 'threeD') {
        return topLevelProperties.threeD.map((v) => ({
          values: [{ property: [v] }],
        }));
      }
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
  filter?: Filter;
  aggregate?: string;
  aggregateFilter?: any;
  advancedFilter?: any;
  properties?: any[];
};
const aggregateQueryKey = ({
  type,
  filter,
  advancedFilter,
  aggregate,
  aggregateFilter,
  properties,
}: AggregateParams): QueryKey => [
  ...AGGREGATE_BASE_KEY,
  type,
  aggregate,
  aggregateFilter,
  filter,
  advancedFilter,
  properties,
];

export type Aggregate = {
  count: number;
  values?: (string | number)[];
};

const getAggregate = (sdk: CogniteClient, params: AggregateParams) =>
  sdk
    .post<{ items: Aggregate[] }>(
      `/api/v1/projects/${sdk.project}/${params.type}/aggregate`,
      {
        headers: {
          'cdf-version': 'alpha',
        },
        data: {
          filter: params.filter,
          advancedFilter: params.advancedFilter,
          aggregate: params.aggregate,
          aggregateFilter: params.aggregateFilter,
          properties: params.properties,
        },
      }
    )
    .then((r) => {
      if (r.status === 200) {
        return r.data.items;
      } else {
        return Promise.reject(r);
      }
    });

export const fetchAggregate = (
  sdk: CogniteClient,
  queryClient: QueryClient,
  params: AggregateParams,
  options?: FetchQueryOptions<Aggregate[] | undefined, CogniteError>
) => {
  return queryClient.fetchQuery(
    aggregateQueryKey(params),
    () => getAggregate(sdk, params),
    options
  );
};

export const useAggregate = (
  params: AggregateParams,
  options?: UseQueryOptions<Aggregate[] | undefined, CogniteError>
) => {
  const sdk = useSDK();
  return useQuery(
    aggregateQueryKey(params),
    () => getAggregate(sdk, params),
    options
  );
};
