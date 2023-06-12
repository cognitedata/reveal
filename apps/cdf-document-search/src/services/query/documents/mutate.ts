import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useSDK } from '@cognite/sdk-provider';
import { doDocumentSearch } from '../../api';
import { DOCUMENTS_KEYS } from '../../constants';
import { DocumentSearchQuery } from '../../types';

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
