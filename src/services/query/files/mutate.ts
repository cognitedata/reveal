import { useSDK } from '@cognite/sdk-provider';
import { useMutation, useQueryClient } from 'react-query';
import { updateFileLabels } from 'services/api';
import { DOCUMENTS_QUERY_KEYS } from 'services/constants';
import { Toast } from 'components/Toast';
import { FilesApiError, LabelFileUpdate } from 'services/types';

export const useUpdateFileLabelsMutate = (action: 'add' | 'remove') => {
  const sdk = useSDK();
  const queryClient = useQueryClient();

  return useMutation(
    ({ label, documentIds }: LabelFileUpdate) =>
      updateFileLabels(sdk, action, label, documentIds),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(DOCUMENTS_QUERY_KEYS.list);
        Toast.info({
          title: 'Updating file labels',
          message:
            'Changing file labels might take some time to take effect in the backend...',
          autoClose: 10_000,
        });
      },
      onError: ({ errors }: FilesApiError, { label: { externalId } }) => {
        errors.forEach(({ message, status }) => {
          Toast.error({
            title: `Error while updating label ("${externalId}") in files`,
            message,
            status,
          });
        });
      },
    }
  );
};
