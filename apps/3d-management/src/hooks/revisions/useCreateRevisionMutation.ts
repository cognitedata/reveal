import { useMutation, useQueryClient } from '@tanstack/react-query';

import { CreateRevision3D, HttpError, Revision3D } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';

import { fireErrorNotification, QUERY_KEY } from '../../utils';

type CreateRevisionArgs = { modelId: number } & CreateRevision3D;

export function useCreateRevisionMutation() {
  const queryClient = useQueryClient();
  const sdk = useSDK();
  const createRevision = async ({
    modelId,
    ...revision
  }: CreateRevisionArgs): Promise<Revision3D> => {
    const items = await sdk.revisions3D.create(modelId, [revision]);
    return items[0];
  };

  return useMutation<Revision3D, HttpError, CreateRevisionArgs>(
    createRevision,
    {
      onSuccess: (newRevision: Revision3D, { modelId }: CreateRevisionArgs) => {
        const queryKey = QUERY_KEY.REVISIONS({ modelId });
        queryClient.setQueryData<Revision3D[]>(queryKey, (old) => {
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
