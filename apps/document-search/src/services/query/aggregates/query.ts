import { useQuery } from '@tanstack/react-query';

import { useSDK } from '@cognite/sdk-provider';
import { composeAggregates } from '../../compose/aggregates';
import { AGGREGATES_KEYS } from '../../constants';

export const useAggregatesQuery = () => {
  const sdk = useSDK();

  return useQuery(AGGREGATES_KEYS.aggregates(), () => composeAggregates(sdk), {
    staleTime: Infinity,
  });
};
