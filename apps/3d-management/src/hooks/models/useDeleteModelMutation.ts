import sdk from '@cognite/cdf-sdk-singleton';
import { useMutation, useQueryClient } from 'react-query';
import { fireErrorNotification, QUERY_KEY } from 'utils';
import { useDispatch, useSelector } from 'react-redux';
import { AppState } from 'store/modules/App/types';
import { setSelectedModels } from 'store/modules/App';
import { HttpError, InternalId } from '@cognite/sdk-core/dist/src';
import { Model3D } from '@cognite/sdk';

const deleteModel = async ({ id }: InternalId): Promise<void> => {
  await sdk.models3D.delete([{ id }]);
};

export function useDeleteModelMutation() {
  const queryClient = useQueryClient();
  const dispatch = useDispatch();
  const appState = useSelector((state: any) => state.app) as AppState;

  return useMutation<void, HttpError, InternalId, Model3D[]>(deleteModel, {
    onMutate: ({ id }: InternalId) => {
      queryClient.cancelQueries(QUERY_KEY.MODELS, { exact: true });

      // Snapshot the previous value
      const previousModels = queryClient.getQueryData<Model3D[]>(
        QUERY_KEY.MODELS
      );

      // Optimistically update to the new value
      queryClient.setQueryData<Model3D[]>(QUERY_KEY.MODELS, (old) =>
        (old || []).filter((model) => {
          return model.id !== id;
        })
      );

      return previousModels || [];
    },
    onError: (error, _, snapshotValue) => {
      queryClient.setQueryData(QUERY_KEY.MODELS, snapshotValue);
      fireErrorNotification({
        error,
        message: 'Error: Could not delete a model',
      });
    },
    onSuccess: (_, { id }: InternalId) => {
      queryClient.invalidateQueries(QUERY_KEY.MODELS, { exact: true });
      setSelectedModels(
        appState.selectedModels.filter((modelId) => modelId !== id)
      )(dispatch);
    },
  });
}
