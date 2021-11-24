import { useSDK } from '@cognite/sdk-provider';
import { Label } from '@cognite/sdk';
import { useMutation, useQueryClient } from 'react-query';
import {
  updateDocumentPipelinesActiveClassifier,
  updateDocumentPipelinesTrainingLabels,
} from 'services/api';
import { CLASSIFIER_KEYS } from 'services/constants';
import { Toast } from 'components/Toast';
import { ApiError } from 'services/types';

export const useDocumentsActiveClassifierPipelineMutate = () => {
  const sdk = useSDK();
  const queryClient = useQueryClient();

  return useMutation(
    (classifierId: number) =>
      updateDocumentPipelinesActiveClassifier(sdk, classifierId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(CLASSIFIER_KEYS.classifiers());

        Toast.success({
          title: 'Deployed a new model',
          message: 'Successfully deployed a new model to the classifier',
        });
      },
      onError: (error: ApiError) => {
        Toast.error({
          title: `Failed while deploying new model`,
          status: error?.status || 400,
          message: error?.message,
        });
      },
    }
  );
};

export const useDocumentsUpdatePipelineMutate = (action: 'add' | 'remove') => {
  const sdk = useSDK();
  const queryClient = useQueryClient();

  return useMutation(
    (labels: Label[]) =>
      updateDocumentPipelinesTrainingLabels(sdk, action, labels),
    {
      onSuccess: (_data, variable) => {
        queryClient.invalidateQueries(CLASSIFIER_KEYS.trainingSets());

        const logActionPrefix = action === 'add' ? 'added' : 'removed';
        Toast.success({
          title: `Successfully ${logActionPrefix} labels`,
          message: `${variable.length} labels were ${logActionPrefix}`,
        });
      },
      onError: (error: ApiError) => {
        Toast.error({
          title: `Failed while updating labels`,
          status: error?.status || 400,
          message: error?.message,
        });
      },
    }
  );
};
