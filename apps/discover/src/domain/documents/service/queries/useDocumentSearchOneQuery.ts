import { searchDocumentById } from 'domain/documents/internal/transformers/searchDocumentById';

import { useQuery } from 'react-query';

import { Document } from '@cognite/sdk';

import { DOCUMENTS_QUERY_KEY } from 'constants/react-query';

export const useDocumentSearchOneQuery = (id: Document['id']) => {
  return useQuery([DOCUMENTS_QUERY_KEY.SEARCH_ONE, id], () => {
    return searchDocumentById(id);
  });
};
