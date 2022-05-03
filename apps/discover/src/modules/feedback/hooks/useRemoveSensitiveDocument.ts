import { useQueryClient } from 'react-query';

import { useDocumentSearchResultQuery } from 'services/documentSearch/queries/useDocumentSearchResultQuery';

import { DOCUMENTS_QUERY_KEY } from 'constants/react-query';
import { useDocumentSearchOptions } from 'modules/documentSearch/hooks/useDocumentSearchOptions';
import { useDocumentSearchQueryFull } from 'modules/documentSearch/hooks/useDocumentSearchQueryFull';

export const useRemoveSensitiveDocument = () => {
  const queryClient = useQueryClient();
  const searchQuery = useDocumentSearchQueryFull();
  const options = useDocumentSearchOptions();
  const { results } = useDocumentSearchResultQuery();

  return (documentId: string) => {
    const hits = results.hits.filter((hit) => hit.id !== documentId);

    if (hits.length === results.hits.length) return;

    queryClient.setQueryData(
      [DOCUMENTS_QUERY_KEY.SEARCH, searchQuery, options],
      {
        ...results,
        hits,
        count: hits.length,
      }
    );
  };
};
