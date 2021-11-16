import { useSDK } from '@cognite/sdk-provider';
import { Label } from '@cognite/sdk';
import { useMutation, useQueryClient } from 'react-query';
import { doDocumentSearch, updateDocumentPipelines } from 'services/api';
import { DOCUMENTS_QUERY_KEYS } from 'services/constants';
import { ApiError, DocumentSearchQuery } from 'services/types';
import { Toast } from 'components/Toast';

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

export const useDocumentsUpdatePipelineMutate = (action: 'add' | 'remove') => {
  const sdk = useSDK();
  const queryClient = useQueryClient();

  return useMutation(
    (labels: Label[]) => updateDocumentPipelines(sdk, action, labels),
    {
      onSuccess: (_data, variable) => {
        queryClient.invalidateQueries(DOCUMENTS_QUERY_KEYS.trainingSet);

        const logActionPrefix = action === 'add' ? 'added' : 'removed';
        Toast.success({
          title: `Successfully ${logActionPrefix} labels`,
          message: `${variable.length} labels were ${logActionPrefix}`,
        });
      },
      onError: (error: ApiError) => {
        Toast.error({
          title: `Failed while updating labels`,
          status: error?.status || 400,
          message: error?.message,
        });
      },
    }
  );
};
