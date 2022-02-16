import sdk from '@cognite/cdf-sdk-singleton';
import { HttpError, Revision3D, UpdateRevision3D } from '@cognite/sdk';
import { useMutation, useQueryClient } from 'react-query';
import { fireErrorNotification, QUERY_KEY } from 'src/utils';

type UpdateArgs = {
  modelId: number;
  revisionId: number;
} & Partial<Pick<Revision3D, 'published' | 'rotation' | 'camera'>>;

const updateRevision = async (payload: UpdateArgs): Promise<Revision3D> => {
  const filter = ['published', 'rotation', 'camera'];

  const filtered: UpdateRevision3D['update'] = filter.reduce(
    (accumulator, key) => {
      if (key in payload) {
        accumulator[key] = { set: payload[key] };
      }
      return accumulator;
    },
    {}
  );

  const items = await sdk.revisions3D.update(payload.modelId, [
    {
      id: payload.revisionId,
      update: {
        ...filtered,
      },
    },
  ]);

  return items[0];
};

export function useUpdateRevisionMutation() {
  const queryClient = useQueryClient();
  return useMutation<Revision3D, HttpError, UpdateArgs, Revision3D[]>(
    updateRevision,
    {
      onMutate: ({ modelId, revisionId, ...updates }: UpdateArgs) => {
        const queryKey = [QUERY_KEY.REVISIONS, { modelId }];
        const snapshot = queryClient.getQueryData<Revision3D[]>(queryKey);

        queryClient.setQueryData<Revision3D[]>(queryKey, (old) => {
          return (old || []).map((revision) => {
            return revision.id === revisionId
              ? { ...revision, ...updates }
              : revision;
          });
        });

        return snapshot || [];
      },
      onError: (error, { modelId }, snapshotValue) => {
        const queryKey = [QUERY_KEY.REVISIONS, { modelId }];
        queryClient.setQueryData(queryKey, snapshotValue);
        fireErrorNotification({
          error,
          message: 'Error: Could not update a revision',
        });
      },
    }
  );
}
