import { useQuery, useQueryClient } from '@tanstack/react-query';

import { useSDK } from '@cognite/sdk-provider';

import { queryKeys } from '../../../queryKeys';
import { fetchAllLabels } from '../network';

export const usePrefetchAllLabelsQuery = () => {
  const queryClient = useQueryClient();
  const sdk = useSDK();

  queryClient.prefetchQuery(queryKeys.allLabels(), () => fetchAllLabels(sdk));
};

export const useAllLabelsQuery = () => {
  const sdk = useSDK();

  return useQuery(queryKeys.allLabels(), () => fetchAllLabels(sdk), {
    staleTime: Infinity,
    cacheTime: Infinity,
  });
};
