import { useMutation, useQueryClient } from '@tanstack/react-query';

import { HttpError, Model3D } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';

import { fireErrorNotification, QUERY_KEY } from '../../utils';

type UpdateArgs = { id: number; name: string };

export function useUpdateModelMutation() {
  const queryClient = useQueryClient();
  const sdk = useSDK();
  const updateModel = async ({ id, name }: UpdateArgs): Promise<Model3D> => {
    const items = await sdk.models3D.update([
      {
        id,
        update: { name: { set: name } },
      },
    ]);
    return items[0];
  };

  return useMutation<Model3D, HttpError, UpdateArgs, Model3D[]>(updateModel, {
    onMutate: ({ id, name }: UpdateArgs) => {
      const snapshot = queryClient.getQueryData<Model3D[]>(QUERY_KEY.MODELS);

      queryClient.setQueryData<Model3D[]>(QUERY_KEY.MODELS, (old) => {
        return (old || []).map((model) => {
          return model.id === id ? { ...model, name } : model;
        });
      });

      return snapshot || [];
    },
    onError: (error, _, snapshotValue) => {
      queryClient.setQueryData(QUERY_KEY.MODELS, snapshotValue);
      fireErrorNotification({
        error,
        message: 'Error: Could not rename a model',
      });
    },
  });
}
