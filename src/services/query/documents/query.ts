import { useSDK } from '@cognite/sdk-provider';
import { useQuery } from 'react-query';
import {
  doDocumentSearch,
  fetchDocumentById,
  fetchDocumentList,
  previewDocument,
} from 'src/services/api';

import { DOCUMENTS_KEYS } from 'src/services/constants';
import { useLabelParams } from 'src/hooks/useParams';

export const useDocumentsSearchQuery = (enabled = true) => {
  const sdk = useSDK();

  const { data = [], ...rest } = useQuery(
    DOCUMENTS_KEYS.searches(),
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
    DOCUMENTS_KEYS.documents(externalId),
    ({ queryKey: [_all, _document, _label, id] }) =>
      fetchDocumentList(sdk, id as string),
    {
      enabled: enabled && Boolean(externalId),
    }
  );

  return { data, ...rest };
};

export const useDocumentQuery = (documentId?: number) => {
  const sdk = useSDK();

  return useQuery(
    DOCUMENTS_KEYS.document(documentId),
    ({ queryKey: [_all, _document, id] }) =>
      fetchDocumentById(sdk, id as number),
    {
      enabled: Boolean(documentId),
    }
  );
};

export const useDocumentPreviewQuery = (
  documentId?: number,
  page?: 0 | 1 | 2
) => {
  const sdk = useSDK();

  return useQuery(
    DOCUMENTS_KEYS.preview(documentId),
    () => previewDocument(sdk, documentId, page),
    {
      enabled: Boolean(documentId),
      staleTime: Infinity,
    }
  );
};
