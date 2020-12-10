import { v3, v3Client as sdk } from '@cognite/cdf-sdk-singleton';
import { useMutation, useQueryCache } from 'react-query';
import { fireErrorNotification, QUERY_KEY } from 'src/utils';

type UpdateArgs = {
  modelId: number;
  revisionId: number;
} & Partial<Pick<v3.Revision3D, 'published' | 'rotation' | 'camera'>>;

const updateRevision = async (payload: UpdateArgs): Promise<v3.Revision3D> => {
  const filter = ['published', 'rotation', 'camera'];

  const filtered: v3.UpdateRevision3D['update'] = filter.reduce(
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
  const queryCache = useQueryCache();
  return useMutation<v3.Revision3D, v3.HttpError, UpdateArgs, v3.Revision3D[]>(
    updateRevision,
    {
      onMutate: ({ modelId, revisionId, ...updates }: UpdateArgs) => {
        const queryKey = [QUERY_KEY.REVISIONS, { modelId }];
        const snapshot = queryCache.getQueryData<v3.Revision3D[]>(queryKey);

        queryCache.setQueryData<v3.Revision3D[]>(queryKey, (old) => {
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
        queryCache.setQueryData(queryKey, snapshotValue);
        fireErrorNotification({
          error,
          message: 'Error: Could not update a revision',
        });
      },
    }
  );
}
