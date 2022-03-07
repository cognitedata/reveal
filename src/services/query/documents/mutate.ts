import { useSDK } from '@cognite/sdk-provider';
import { useMutation, useQueryClient } from 'react-query';
import { doDocumentSearch } from 'src/services/api';
import { DOCUMENTS_KEYS } from 'src/services/constants';
import { DocumentSearchQuery } from 'src/services/types';

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
