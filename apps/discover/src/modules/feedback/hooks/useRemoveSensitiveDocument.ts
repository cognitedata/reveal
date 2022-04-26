import { useQueryClient } from 'react-query';

import { useDocumentSearchResultQuery } from 'services/documentSearch/useDocumentSearchResultQuery';

import { DOCUMENTS_QUERY_KEY } from 'constants/react-query';
import { useDocumentSearchOptions } from 'modules/documentSearch/hooks/useDocumentSearchOptions';
import { useDocumentSearchQueryFull } from 'modules/documentSearch/hooks/useDocumentSearchQueryFull';

export const useRemoveSensitiveDocument = () => {
  const queryClient = useQueryClient();
  const searchQuery = useDocumentSearchQueryFull();
  const options = useDocumentSearchOptions();
  const { data: documentResult } = useDocumentSearchResultQuery();

  return (documentId: string) => {
    const hits = documentResult.hits.filter((hit) => hit.id !== documentId);

    if (hits.length === documentResult.hits.length) return;

    queryClient.setQueryData(
      [DOCUMENTS_QUERY_KEY.SEARCH, searchQuery, options],
      {
        ...documentResult,
        hits,
        count: hits.length,
      }
    );
  };
};
