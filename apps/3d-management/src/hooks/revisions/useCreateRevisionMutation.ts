import sdk from '@cognite/cdf-sdk-singleton';
import { CreateRevision3D, HttpError, Revision3D } from '@cognite/sdk';
import { useMutation, useQueryClient } from 'react-query';
import { fireErrorNotification, QUERY_KEY } from 'src/utils';

type CreateRevisionArgs = { modelId: number } & CreateRevision3D;

const createRevision = async ({
  modelId,
  ...revision
}: CreateRevisionArgs): Promise<Revision3D> => {
  const items = await sdk.revisions3D.create(modelId, [revision]);
  return items[0];
};

export function useCreateRevisionMutation() {
  const queryClient = useQueryClient();
  return useMutation<Revision3D, HttpError, CreateRevisionArgs>(
    createRevision,
    {
      onSuccess: (newRevision: Revision3D, { modelId }: CreateRevisionArgs) => {
        const queryKey = [QUERY_KEY.REVISIONS, { modelId }];
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
