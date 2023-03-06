import { useSDK } from '@cognite/sdk-provider';
import { CogniteError } from '@cognite/sdk';
import {
  QueryKey,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from '@tanstack/react-query';
import { PropertyAggregate } from 'common/types';
import { Filter, SourceType, TargetType } from 'context/QuickMatchContext';
import {
  fetchProperties as fetchTSProperties,
  fetchTimeseriesAggregate,
} from './timeseries';
import { fetchProperties as fetchEventProperties } from './events';
import { fetchProperties as fetchAssetProperties } from './assets';

type T = SourceType | TargetType;

const AGGREGATE_BASE_KEY = ['aggregate'];

export const aggregatePropertyQueryKey = (t: T): QueryKey => [
  ...AGGREGATE_BASE_KEY,
  'properties',
  t,
];
export const useAggregateProperties = (
  t: T,
  options?: UseQueryOptions<PropertyAggregate[], CogniteError>
) => {
  const sdk = useSDK();
  const queryClient = useQueryClient();
  return useQuery(
    aggregatePropertyQueryKey(t),
    () => {
      switch (t) {
        case 'timeseries': {
          return fetchTSProperties(sdk, queryClient);
        }
        case 'assets': {
          return fetchAssetProperties(sdk, queryClient);
        }
        case 'events':
          return fetchEventProperties(sdk, queryClient);
        default: {
          return Promise.reject(`type: ${t} not implemented`);
        }
      }
    },
    options
  );
};

type AggregateParams = {
  type: T;
  filter: Filter;
  advancedFilter?: any;
};
export const aggregateQueryKey = (
  { type, filter, advancedFilter }: AggregateParams // {
): //   type: T;
//   filter?: Filter;
//   advancedFilter?: any;
// }
QueryKey => [...AGGREGATE_BASE_KEY, type, filter, advancedFilter];
export const useAggregate = (
  params: AggregateParams,
  options?: UseQueryOptions<number | undefined, CogniteError>
) => {
  const sdk = useSDK();
  const queryClient = useQueryClient();
  return useQuery(
    aggregateQueryKey(params),
    () => {
      switch (params.type) {
        case 'timeseries': {
          return fetchTimeseriesAggregate(params, sdk, queryClient);
        }
        default: {
          return Promise.reject(`type: ${params.type} not implemented`);
        }
      }
    },
    options
  );
};
