import { useSDK } from '@cognite/sdk-provider';
import { useQuery } from 'react-query';
import { composeAggregates } from 'services/compose/aggregates';
import { DOCUMENTS_QUERY_KEYS } from 'services/constants';

export const useAggregatesQuery = () => {
  const sdk = useSDK();

  return useQuery(
    DOCUMENTS_QUERY_KEYS.aggregates,
    () => composeAggregates(sdk),
    {
      staleTime: Infinity,
    }
  );
};
