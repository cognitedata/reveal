import { useQuery, UseQueryResult } from '@tanstack/react-query';

import { DatapointAggregate } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';

import { queryKeys } from '../../queryKeys';
import { DatapointAggregatesQuery } from '../types';
import { getTimeseriesDatapointAggregates } from '../network/getTimeseriesDatapointAggregates';

export const useTimeseriesDatapointAggregatesQuery = (
  query: DatapointAggregatesQuery,
  enabled?: boolean
): UseQueryResult<DatapointAggregate[]> => {
  const sdk = useSDK();

  return useQuery(
    queryKeys.datapointAggregates(query),
    () => {
      return getTimeseriesDatapointAggregates(sdk, query).catch(() => {
        return [] as DatapointAggregate[];
      });
    },
    { enabled }
  );
};
