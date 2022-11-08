import { useDocumentSearch } from '@cognite/react-document-search';
import { normalize } from 'domain/documents';

export const useDocumentSearchQuery = () => {
  const { results, ...rest } = useDocumentSearch();
  return {
    results: normalize(results),
    ...rest,
  };
};
