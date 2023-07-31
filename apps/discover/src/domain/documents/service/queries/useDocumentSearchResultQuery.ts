import { useDocumentSearchOptions } from 'modules/documentSearch/hooks/useDocumentSearchOptions';
import { useDocumentSearchQueryFull } from 'modules/documentSearch/hooks/useDocumentSearchQueryFull';

import { InifniteQueryResponse } from './types';
import { useDocumentSearchQuery } from './useDocumentSearchQuery';

export const useDocumentSearchResultQuery = (): InifniteQueryResponse => {
  const searchQuery = useDocumentSearchQueryFull();
  const options = useDocumentSearchOptions();
  return useDocumentSearchQuery(searchQuery, options);
};
