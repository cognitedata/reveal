import sdk from '@cognite/cdf-sdk-singleton';
import { CreateModel3D, HttpError, Model3D } from '@cognite/sdk';
import { useMutation, useQueryCache } from 'react-query';
import { fireErrorNotification, QUERY_KEY } from 'src/utils';

const addModel = async ({ name }: CreateModel3D): Promise<Model3D> => {
  const items = await sdk.models3D.create([{ name }]);
  return items[0];
};

export function useCreateModelMutation() {
  const queryCache = useQueryCache();
  return useMutation<Model3D, HttpError, CreateModel3D, Model3D[]>(addModel, {
    onSuccess: () => {
      queryCache.invalidateQueries(QUERY_KEY.MODELS, { exact: true });
    },
    onError: (error) => {
      fireErrorNotification({
        error,
        message: 'Error: Could not create a model',
      });
    },
  });
}
