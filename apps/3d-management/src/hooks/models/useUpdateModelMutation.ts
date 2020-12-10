import { v3, v3Client as sdk } from '@cognite/cdf-sdk-singleton';
import { useMutation, useQueryCache } from 'react-query';
import { fireErrorNotification, QUERY_KEY } from 'src/utils';

type UpdateArgs = { id: number; name: string };

const updateModel = async ({ id, name }: UpdateArgs): Promise<v3.Model3D> => {
  const items = await sdk.models3D.update([
    {
      id,
      update: { name: { set: name } },
    },
  ]);
  return items[0];
};

export function useUpdateModelMutation() {
  const queryCache = useQueryCache();
  return useMutation<v3.Model3D, v3.HttpError, UpdateArgs, v3.Model3D[]>(
    updateModel,
    {
      onMutate: ({ id, name }: UpdateArgs) => {
        const snapshot = queryCache.getQueryData<v3.Model3D[]>(
          QUERY_KEY.MODELS
        );

        queryCache.setQueryData<v3.Model3D[]>(QUERY_KEY.MODELS, (old) => {
          return (old || []).map((model) => {
            return model.id === id ? { ...model, name } : model;
          });
        });

        return snapshot || [];
      },
      onError: (error, _, snapshotValue) => {
        queryCache.setQueryData(QUERY_KEY.MODELS, snapshotValue);
        fireErrorNotification({
          error,
          message: 'Error: Could not rename a model',
        });
      },
    }
  );
}
