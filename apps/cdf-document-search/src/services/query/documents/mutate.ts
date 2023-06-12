import { useSDK } from '@cognite/sdk-provider';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { doDocumentSearch } from 'apps/cdf-document-search/src/services/api';
import { DOCUMENTS_KEYS } from 'apps/cdf-document-search/src/services/constants';
import { DocumentSearchQuery } from 'apps/cdf-document-search/src/services/types';

export const useDocumentsSearchMutate = () => {
  const sdk = useSDK();
  const queryClient = useQueryClient();

  return useMutation(
    (query: DocumentSearchQuery) => doDocumentSearch(sdk, query),
    {
      onSuccess: (result) => {
        queryClient.setQueriesData(DOCUMENTS_KEYS.searches(), result);
      },
    }
  );
};
