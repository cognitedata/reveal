import { useMutation, useQueryClient } from '@tanstack/react-query';

import { HttpError, Revision3D } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';

import { fireErrorNotification, QUERY_KEY } from '../../utils';
import { RevisionIds } from '../../utils/types';

export function useDeleteRevisionMutation() {
  const queryClient = useQueryClient();
  const sdk = useSDK();

  const deleteRevision = async ({
    modelId,
    revisionId,
  }: RevisionIds): Promise<void> => {
    await sdk.revisions3D.delete(modelId, [{ id: revisionId }]);
  };

  return useMutation<void, HttpError, RevisionIds, Revision3D[]>(
    deleteRevision,
    {
      onMutate: ({ modelId, revisionId }: RevisionIds) => {
        const queryKey = QUERY_KEY.REVISIONS({ modelId });
        queryClient.cancelQueries(queryKey);

        // Snapshot the previous value
        const previousRevisions =
          queryClient.getQueryData<Revision3D[]>(queryKey);

        // Optimistically update to the new value
        queryClient.setQueryData<Revision3D[]>(queryKey, (old) =>
          (old || []).filter((revision) => {
            return revision.id !== revisionId;
          })
        );

        return previousRevisions || [];
      },
      onError: (error, { modelId }, snapshotValue) => {
        const queryKey = QUERY_KEY.REVISIONS({ modelId });
        queryClient.setQueryData(queryKey, snapshotValue);
        fireErrorNotification({
          error,
          message: 'Error: Could not delete a revision',
        });
      },
      onSuccess: (_, { modelId }: RevisionIds) => {
        const queryKey = QUERY_KEY.REVISIONS({ modelId });
        queryClient.invalidateQueries(queryKey);
      },
    }
  );
}
