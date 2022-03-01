import { useSDK } from '@cognite/sdk-provider';
import { Toast } from 'components/Toast';
import { useMutation, useQueryClient } from 'react-query';
import {
  createDocumentClassifier,
  deleteDocumentClassifier,
} from 'services/api';
import { CLASSIFIER_KEYS } from 'services/constants';
import { ApiError } from 'services/types';

export const useClassifierCreateMutate = () => {
  const sdk = useSDK();
  const queryClient = useQueryClient();

  return useMutation(
    (classifierName: string) =>
      createDocumentClassifier(sdk, { name: classifierName }),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(CLASSIFIER_KEYS.trainingSets());
      },
      onError: (error: ApiError) => {
        Toast.error({
          title: `Failed while creating a classifier model`,
          status: error?.status || 400,
          message: error?.message,
        });
      },
    }
  );
};

export const useClassifierDeleteMutate = () => {
  const sdk = useSDK();
  const queryClient = useQueryClient();

  return useMutation(
    (classifierId: number) => deleteDocumentClassifier(sdk, classifierId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(CLASSIFIER_KEYS.classifiers());
      },
      onError: (error: ApiError) => {
        Toast.error({
          title: `Failed while deleting a classifier model`,
          status: error?.status || 400,
          message: error?.message,
        });
      },
    }
  );
};
