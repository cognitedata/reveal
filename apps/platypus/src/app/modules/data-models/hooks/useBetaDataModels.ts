import { TOKENS } from '@platypus-app/di';
import { useInjection } from '@platypus-app/hooks/useInjection';
import { QueryKeys } from '@platypus-app/utils/queryKeys';
import { useQuery } from '@tanstack/react-query';

export const useBetaDataModels = () => {
  const dmsApiService = useInjection(TOKENS.dataModelStorageApiService);

  return useQuery(QueryKeys.LIST_DMS_SPACES, () => dmsApiService.listSpaces(), {
    staleTime: Infinity,
  });
};
