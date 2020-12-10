import { v3, v3Client as sdk } from '@cognite/cdf-sdk-singleton';
import { useMutation, useQueryCache } from 'react-query';
import { fireErrorNotification, QUERY_KEY } from 'src/utils';

type CreateRevisionArgs = { modelId: number } & v3.CreateRevision3D;

const createRevision = async ({
  modelId,
  ...revision
}: CreateRevisionArgs): Promise<v3.Revision3D> => {
  const items = await sdk.revisions3D.create(modelId, [revision]);
  return items[0];
};

export function useCreateRevisionMutation() {
  const queryCache = useQueryCache();
  return useMutation<v3.Revision3D, v3.HttpError, CreateRevisionArgs>(
    createRevision,
    {
      onSuccess: (
        newRevision: v3.Revision3D,
        { modelId }: CreateRevisionArgs
      ) => {
        const queryKey = [QUERY_KEY.REVISIONS, { modelId }];
        queryCache.setQueryData<v3.Revision3D[]>(queryKey, (old) => {
          return [newRevision].concat(old || []);
        });
      },
      onError: (error) => {
        fireErrorNotification({
          error,
          message: 'Error: Could not create a revision',
        });
      },
    }
  );
}
