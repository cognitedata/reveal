import React, { useMemo } from 'react';

import { useInfiniteQuery, useQuery } from '@tanstack/react-query';

import { DocumentsClassifier } from '@cognite/sdk-playground';
import { useSDK } from '@cognite/sdk-provider';

import { isClassifierTraining } from '../../../utils/classifier';
import {
  fetchDocumentClassifierById,
  fetchDocumentClassifiers,
} from '../../api';
import {
  composeActiveClassifier,
  composeClassifierTrainingSets,
} from '../../compose';
import { CLASSIFIER_KEYS } from '../../constants';

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

  const data = useMemo(() => {
    return queryResults.data?.pages.reduce<DocumentsClassifier[]>(
      (result, page) => {
        const items = page.items;
        return [...result, ...items];
      },
      []
    );
  }, [queryResults.data?.pages]);

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
    () => fetchDocumentClassifierById(sdk, id as number),
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
