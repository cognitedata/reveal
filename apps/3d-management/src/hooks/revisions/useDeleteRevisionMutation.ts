import sdk from '@cognite/cdf-sdk-singleton';
import { HttpError, Revision3D } from '@cognite/sdk';
import { useMutation, useQueryCache } from 'react-query';
import { fireErrorNotification, QUERY_KEY } from 'src/utils';
import { RevisionIds } from 'src/utils/types';

const deleteRevision = async ({
  modelId,
  revisionId,
}: RevisionIds): Promise<void> => {
  await sdk.revisions3D.delete(modelId, [{ id: revisionId }]);
};

export function useDeleteRevisionMutation() {
  const queryCache = useQueryCache();

  return useMutation<void, HttpError, RevisionIds, Revision3D[]>(
    deleteRevision,
    {
      onMutate: ({ modelId, revisionId }: RevisionIds) => {
        const queryKey = [QUERY_KEY.REVISIONS, { modelId }];
        queryCache.cancelQueries(queryKey);

        // Snapshot the previous value
        const previousRevisions = queryCache.getQueryData<Revision3D[]>(
          queryKey
        );

        // Optimistically update to the new value
        queryCache.setQueryData<Revision3D[]>(queryKey, (old) =>
          (old || []).filter((revision) => {
            return revision.id !== revisionId;
          })
        );

        return previousRevisions || [];
      },
      onError: (error, { modelId }, snapshotValue) => {
        const queryKey = [QUERY_KEY.REVISIONS, { modelId }];
        queryCache.setQueryData(queryKey, snapshotValue);
        fireErrorNotification({
          error,
          message: 'Error: Could not delete a revision',
        });
      },
      onSuccess: (_, { modelId }: RevisionIds) => {
        const queryKey = [QUERY_KEY.REVISIONS, { modelId }];
        queryCache.invalidateQueries(queryKey);
      },
    }
  );
}
