import { v3, v3Client as sdk } from '@cognite/cdf-sdk-singleton';
import { useMutation, useQueryCache } from 'react-query';
import { fireErrorNotification, QUERY_KEY } from 'src/utils';

const addModel = async ({ name }: v3.CreateModel3D): Promise<v3.Model3D> => {
  const items = await sdk.models3D.create([{ name }]);
  return items[0];
};

export function useCreateModelMutation() {
  const queryCache = useQueryCache();
  return useMutation<v3.Model3D, v3.HttpError, v3.CreateModel3D, v3.Model3D[]>(
    addModel,
    {
      onSuccess: () => {
        queryCache.invalidateQueries(QUERY_KEY.MODELS, { exact: true });
      },
      onError: (error) => {
        fireErrorNotification({
          error,
          message: 'Error: Could not create a model',
        });
      },
    }
  );
}
