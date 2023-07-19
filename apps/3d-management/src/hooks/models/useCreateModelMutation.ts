import { useMutation, useQueryClient } from '@tanstack/react-query';

import { CreateModel3D, HttpError, Model3D } from '@cognite/sdk';
import { useSDK } from '@cognite/sdk-provider';

import { fireErrorNotification, QUERY_KEY } from '../../utils';

export function useCreateModelMutation() {
  const queryClient = useQueryClient();
  const sdk = useSDK();
  const addModel = async ({ name }: CreateModel3D): Promise<Model3D> => {
    const items = await sdk.models3D.create([{ name }]);
    return items[0];
  };
  return useMutation<Model3D, HttpError, CreateModel3D, Model3D[]>(addModel, {
    onSuccess: () => {
      queryClient.invalidateQueries(QUERY_KEY.MODELS, { exact: true });
    },
    onError: (error) => {
      fireErrorNotification({
        error,
        message: 'Error: Could not create a model',
      });
    },
  });
}
