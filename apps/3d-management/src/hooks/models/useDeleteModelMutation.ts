import { v3, v3Client as sdk } from '@cognite/cdf-sdk-singleton';
import { useMutation, useQueryCache } from 'react-query';
import { fireErrorNotification, QUERY_KEY } from 'src/utils';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from 'src/store/modules/App/types';
import { setSelectedModels } from 'src/store/modules/App';

const deleteModel = async ({ id }: v3.InternalId): Promise<void> => {
  await sdk.models3D.delete([{ id }]);
};

export function useDeleteModelMutation() {
  const queryCache = useQueryCache();
  const dispatch = useDispatch();
  const appState = useSelector((state: any) => state.app) as AppState;

  return useMutation<void, v3.HttpError, v3.InternalId, v3.Model3D[]>(
    deleteModel,
    {
      onMutate: ({ id }: v3.InternalId) => {
        queryCache.cancelQueries(QUERY_KEY.MODELS, { exact: true });

        // Snapshot the previous value
        const previousModels = queryCache.getQueryData<v3.Model3D[]>(
          QUERY_KEY.MODELS
        );

        // Optimistically update to the new value
        queryCache.setQueryData<v3.Model3D[]>(QUERY_KEY.MODELS, (old) =>
          (old || []).filter((model) => {
            return model.id !== id;
          })
        );

        return previousModels || [];
      },
      onError: (error, _, snapshotValue) => {
        queryCache.setQueryData(QUERY_KEY.MODELS, snapshotValue);
        fireErrorNotification({
          error,
          message: 'Error: Could not delete a model',
        });
      },
      onSuccess: (_, { id }: v3.InternalId) => {
        queryCache.invalidateQueries(QUERY_KEY.MODELS, { exact: true });
        setSelectedModels(
          appState.selectedModels.filter((modelId) => modelId !== id)
        )(dispatch);
      },
    }
  );
}
