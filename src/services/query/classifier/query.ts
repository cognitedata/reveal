import { useSDK } from '@cognite/sdk-provider';
import { useQuery } from 'react-query';
import { composeClassifierTrainingSets } from 'services/compose';
import { CLASSIFIER_KEYS } from 'services/constants';
import React from 'react';
import {
  fetchDocumentClassifierById,
  fetchDocumentClassifiers,
} from 'services/api';
import { isClassifierTraining } from 'utils/classifier';

export const useClassifierManageTrainingSetsQuery = (disabled = false) => {
  const sdk = useSDK();

  const { data = [], ...rest } = useQuery(
    CLASSIFIER_KEYS.trainingSets(),
    () => composeClassifierTrainingSets(sdk),
    { enabled: !disabled }
  );

  return { data, ...rest };
};

export const useDocumentsClassifiersQuery = () => {
  const sdk = useSDK();

  const { data = [], ...rest } = useQuery(CLASSIFIER_KEYS.classifiers(), () =>
    fetchDocumentClassifiers(sdk)
  );

  return { data, ...rest };
};

export const useDocumentsClassifierByIdQuery = (id?: number) => {
  const sdk = useSDK();

  const [refetchInterval, setRefreshInterval] = React.useState(5000);
  const disableRefreshInterval = () => setRefreshInterval(0);

  return useQuery(
    CLASSIFIER_KEYS.classifier(id),
    () => fetchDocumentClassifierById(sdk, id!),
    {
      enabled: Boolean(id),
      refetchInterval,
      onSuccess: (data) => {
        if (!isClassifierTraining(data)) {
          disableRefreshInterval();
        }
      },
      onError: () => disableRefreshInterval(),
    }
  );
};
