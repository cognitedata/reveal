import { useDocumentCategoryQuery } from 'domain/documents/service/queries/useDocumentQuery';

import { useDeepMemo } from 'hooks/useDeep';

import { getEmptyDocumentCategories } from '../utils';
import { getAvailableDocumentCategories } from '../utils/getAvailableDocumentCategories';

import { useDocumentAggregateResponse } from './useDocumentAggregateResponse';
import { useDocumentSearchQueryFull } from './useDocumentSearchQueryFull';

export const useDocumentQueryFacets = () => {
  const { isLoading, error, data } = useDocumentCategoryQuery();
  const searchQuery = useDocumentSearchQueryFull();
  const aggregateResponse = useDocumentAggregateResponse(searchQuery);

  return useDeepMemo(() => {
    if (!data || 'error' in data) {
      return {
        isLoading,
        error,
        data: getEmptyDocumentCategories(),
      };
    }

    return {
      isLoading,
      error,
      data: getAvailableDocumentCategories(data, aggregateResponse),
    };
  }, [data, aggregateResponse]);
};
