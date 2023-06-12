import { useSDK } from '@cognite/sdk-provider';
import { useQuery } from '@tanstack/react-query';
import { composeAggregates } from 'apps/cdf-document-search/src/services/compose/aggregates';
import { AGGREGATES_KEYS } from 'apps/cdf-document-search/src/services/constants';

export const useAggregatesQuery = () => {
  const sdk = useSDK();

  return useQuery(AGGREGATES_KEYS.aggregates(), () => composeAggregates(sdk), {
    staleTime: Infinity,
  });
};
