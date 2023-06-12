import { DocumentsClassifier } from '@cognite/sdk-playground';
import { useSDK } from '@cognite/sdk-provider';
import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import {
  composeActiveClassifier,
  composeClassifierTrainingSets,
} from 'apps/cdf-document-search/src/services/compose';
import { CLASSIFIER_KEYS } from 'apps/cdf-document-search/src/services/constants';

import React from 'react';
import {
  fetchDocumentClassifierById,
  fetchDocumentClassifiers,
} from 'apps/cdf-document-search/src/services/api';
import { isClassifierTraining } from 'apps/cdf-document-search/src/utils/classifier';

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

  const queryResults = useInfiniteQuery(
    CLASSIFIER_KEYS.classifiers(),
    ({ pageParam }) => fetchDocumentClassifiers(sdk, pageParam),
    {
      getNextPageParam: (lastPage) => {
        return lastPage?.nextCursor;
      },
    }
  );

  const data = queryResults.data?.pages.reduce<DocumentsClassifier[]>(
    (result, page) => {
      const items = page.items;
      return [...result, ...items];
    },
    []
  );

  return {
    data,
    isLoading: queryResults.isLoading,
    fetchNextPage: queryResults.fetchNextPage,
  };
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

export const useDocumentsActiveClassifierQuery = () => {
  const sdk = useSDK();

  return useQuery(CLASSIFIER_KEYS.activeClassifier(), () =>
    composeActiveClassifier(sdk)
  );
};
