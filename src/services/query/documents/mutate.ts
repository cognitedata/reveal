import { useSDK } from '@cognite/sdk-provider';
import { useMutation, useQueryClient } from 'react-query';
import { doDocumentSearch } from 'services/api';
import { DOCUMENTS_QUERY_KEYS } from 'services/constants';
import { DocumentSearchQuery } from 'services/types';

export const useDocumentsSearchMutate = () => {
  const sdk = useSDK();
  const queryClient = useQueryClient();

  return useMutation(
    (query: DocumentSearchQuery) => doDocumentSearch(sdk, query),
    {
      onSuccess: (result) => {
        queryClient.setQueriesData([DOCUMENTS_QUERY_KEYS.search], result);
      },
    }
  );
};
