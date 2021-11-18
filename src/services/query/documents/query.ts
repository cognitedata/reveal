import { useSDK } from '@cognite/sdk-provider';
import { useQuery } from 'react-query';
import {
  doDocumentSearch,
  fetchDocumentById,
  fetchDocumentClassifierById,
  fetchDocumentClassifiers,
  fetchDocumentList,
  fetchDocumentPipelines,
  previewDocument,
} from 'services/api';
import { DOCUMENTS_QUERY_KEYS } from 'services/constants';
import React from 'react';
import { useLabelParams } from 'hooks/useParams';
import { isClassifierTraining } from 'utils/classifier';

export const useDocumentsSearchQuery = (enabled = true) => {
  const sdk = useSDK();

  const { data = [], ...rest } = useQuery(
    [DOCUMENTS_QUERY_KEYS.search],
    () => doDocumentSearch(sdk),
    {
      enabled,
      staleTime: Infinity,
    }
  );

  return { data, ...rest };
};

export const useDocumentsQuery = (enabled = true) => {
  const sdk = useSDK();
  const externalId = useLabelParams();

  const { data = [], ...rest } = useQuery(
    [DOCUMENTS_QUERY_KEYS.list, externalId],
    ({ queryKey: [_, id] }) => fetchDocumentList(sdk, id),
    {
      enabled,
    }
  );

  return { data, ...rest };
};

export const useDocumentQuery = (documentId?: number) => {
  const sdk = useSDK();

  return useQuery(
    [DOCUMENTS_QUERY_KEYS.byId, documentId],
    ({ queryKey: [_, id] }) => fetchDocumentById(sdk, id as number),
    {
      enabled: !!documentId,
    }
  );
};

export const useDocumentPreviewQuery = (
  documentId?: number,
  page?: 0 | 1 | 2
) => {
  const sdk = useSDK();

  return useQuery(
    [DOCUMENTS_QUERY_KEYS.preview, documentId],
    () => previewDocument(sdk, documentId, page),
    {
      enabled: !!documentId,
      staleTime: Infinity,
    }
  );
};

export const useDocumentsClassifiersQuery = () => {
  const sdk = useSDK();

  const { data = [], ...rest } = useQuery(
    [DOCUMENTS_QUERY_KEYS.classifier],
    () => fetchDocumentClassifiers(sdk)
  );

  return { data, ...rest };
};

export const useDocumentsClassifierByIdQuery = (id?: number) => {
  const sdk = useSDK();

  const [refetchInterval, setRefreshInterval] = React.useState(5000);
  const disableRefreshInterval = () => setRefreshInterval(0);

  return useQuery(
    [DOCUMENTS_QUERY_KEYS.classifier, id],
    () => fetchDocumentClassifierById(sdk, id!),
    {
      enabled: !!id,
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

export const useDocumentsPipelinesQuery = () => {
  const sdk = useSDK();

  return useQuery([DOCUMENTS_QUERY_KEYS.pipelines], () =>
    fetchDocumentPipelines(sdk)
  );
};
