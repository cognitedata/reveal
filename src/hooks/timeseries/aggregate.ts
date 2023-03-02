import { CogniteError, CogniteClient, TimeseriesAggregate } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';
import {
  QueryClient,
  QueryKey,
  useQuery,
  UseQueryOptions,
} from '@tanstack/react-query';
import { PropertyAggregate, PropertyAggregateResponse } from 'common/types';

import { TSParams, TS_BASE_QUERY_KEY } from '.';

type AggregateParams = Pick<TSParams, 'filter' | 'advancedFilter'>;

export const getPropertiesAggregateKey = (): QueryKey => [
  ...TS_BASE_QUERY_KEY,
  'properties-aggregate',
];

export const timeseriesAggregateQueryKey = (f: AggregateParams): QueryKey => [
  ...TS_BASE_QUERY_KEY,
  'aggregate',
  f,
];

export const getTimeseriesAggregate = (
  params: AggregateParams,
  sdk: CogniteClient
) => {
  return sdk
    .post<{ items: TimeseriesAggregate[] }>(
      `/api/v1/projects/${sdk.project}/timeseries/aggregate`,
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
    .then((r) => r.data.items[0]?.count);
};
export const fetchTimeseriesAggregate = (
  params: AggregateParams,
  sdk: CogniteClient,
  qc: QueryClient
) => {
  return qc.fetchQuery(timeseriesAggregateQueryKey(params), () =>
    getTimeseriesAggregate(params, sdk)
  );
};
export const useTimeseriesAggregate = (
  params: AggregateParams,
  opts?: UseQueryOptions<number | undefined, CogniteError>
) => {
  const sdk = useSDK();
  return useQuery(
    timeseriesAggregateQueryKey(params),
    () => getTimeseriesAggregate(params, sdk),
    opts
  );
};

/**
 * NOTE: metadata aggreates are always downcased since metadata filters are case-insensitive.
 */
export const getPropertiesAggregate = async (sdk: CogniteClient) => {
  const topLevelProperties: PropertyAggregate[] = [
    { values: [{ property: ['name'] }] },
    { values: [{ property: ['description'] }] },
    { values: [{ property: ['unit'] }] },
  ];
  return sdk
    .post<PropertyAggregateResponse>(
      `/api/v1/projects/${sdk.project}/timeseries/aggregate`,
      {
        headers: {
          'cdf-version': 'alpha',
        },
        data: { aggregate: 'uniqueProperties', path: ['metadata'] },
      }
    )
    .then((r) => {
      if (r.status === 200) {
        return [...topLevelProperties, ...r.data.items];
      } else {
        return Promise.reject(r);
      }
    });
};

export const fetchProperties = async (sdk: CogniteClient, qc: QueryClient) => {
  return qc.fetchQuery(getPropertiesAggregateKey(), () =>
    getPropertiesAggregate(sdk)
  );
};

export const useProperties = (
  options?: UseQueryOptions<PropertyAggregate[], CogniteError>
) => {
  const sdk = useSDK();
  return useQuery(
    getPropertiesAggregateKey(),
    () => getPropertiesAggregate(sdk),
    options
  );
};
