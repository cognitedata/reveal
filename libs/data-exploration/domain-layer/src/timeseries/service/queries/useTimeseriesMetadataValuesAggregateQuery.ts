import { useQuery, UseQueryOptions } from 'react-query';
import { useSDK } from '@cognite/sdk-provider';
import {
  getTimeseriesMetadataValuesAggregate,
  TimeseriesMetadataAggregateResponse,
  queryKeys,
  TimeseriesProperties,
  AdvancedFilter,
} from '@data-exploration-lib/domain-layer';
import isEmpty from 'lodash/isEmpty';
import isUndefined from 'lodash/isUndefined';

interface Props {
  metadataKey?: string | null;
  query?: string;
  advancedFilter?: AdvancedFilter<TimeseriesProperties>;
  options?: UseQueryOptions<
    TimeseriesMetadataAggregateResponse[],
    unknown,
    TimeseriesMetadataAggregateResponse[],
    any
  >;
}

export const useTimeseriesMetadataValuesAggregateQuery = ({
  metadataKey,
  query,
  advancedFilter,
  options,
}: Props = {}) => {
  const sdk = useSDK();

  return useQuery(
    queryKeys.timeseriesMetadataValues(
      String(metadataKey),
      query,
      advancedFilter
    ),
    () => {
      return getTimeseriesMetadataValuesAggregate(sdk, String(metadataKey), {
        advancedFilter,
        aggregateFilter: query ? { prefix: { value: query } } : undefined,
      });
    },
    {
      enabled:
        !isEmpty(metadataKey) &&
        (isUndefined(options?.enabled) ? true : options?.enabled),
      ...options,
    }
  );
};
