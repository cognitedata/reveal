import { useQuery } from '@tanstack/react-query';

import { useSDK } from '@cognite/sdk-provider';

import { queryKeys } from '../../queryKeys';
import { getTimeseriesSingleAggregateMulti } from '../network';
import { TimeseriesSingleAggregateMultiQuery } from '../types';

interface Props {
  query: TimeseriesSingleAggregateMultiQuery;
}

export const useTimeseriesSingleAggregateQuery = ({ query }: Props) => {
  const sdk = useSDK();

  return useQuery(
    queryKeys.timeseriesSingleAggregate(query),
    () => {
      return getTimeseriesSingleAggregateMulti(sdk, query);
    },
    {
      keepPreviousData: true,
    }
  );
};
