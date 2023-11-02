import { useQuery } from '@tanstack/react-query';

import { useSDK } from '@cognite/sdk-provider';

import { queryKeys } from '../../../queryKeys';
import { getTimeseriesAggregate } from '../network';
import {
  TimeseriesAggregateUniquePropertiesResponse,
  TimeseriesMetadataProperty,
} from '../types';

export const useTimeseriesMetadataKeysQuery = ({
  query,
  enabled = true,
}: {
  query?: string;
  enabled?: boolean;
} = {}) => {
  const sdk = useSDK();

  return useQuery(
    queryKeys.timeseriesMetadataKeys(query),
    () => {
      return getTimeseriesAggregate<TimeseriesAggregateUniquePropertiesResponse>(
        sdk,
        {
          aggregateFilter: query ? { prefix: { value: query } } : undefined,
          aggregate: 'uniqueProperties',
          path: ['metadata'],
        }
      ).then(({ items }) => {
        return items.map(({ count, values: [value] }) => {
          const metadataKey = (value.property as TimeseriesMetadataProperty)[1];
          return {
            count,
            value: metadataKey,
            values: [metadataKey],
          };
        });
      });
    },
    {
      enabled,
      keepPreviousData: true,
    }
  );
};
