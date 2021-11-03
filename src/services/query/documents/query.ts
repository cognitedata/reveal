import { useSDK } from '@cognite/sdk-provider';
import { useQuery } from 'react-query';
import {
  doDocumentSearch,
  fetchDocumentById,
  fetchDocumentList,
  previewDocument,
} from 'services/api';
import { DOCUMENTS_QUERY_KEYS } from 'services/constants';
import { useParams } from 'react-router-dom';

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
  const { externalId } = useParams<{ externalId: string }>();

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

  const { data, ...rest } = useQuery(
    [DOCUMENTS_QUERY_KEYS.preview, documentId],
    () => previewDocument(sdk, documentId, page),
    {
      enabled: !!documentId,
      staleTime: Infinity,
    }
  );

  return { data, ...rest };
};
