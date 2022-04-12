import { useDeepMemo } from 'hooks/useDeep';
import { useDocumentAggregateResponse } from 'modules/documentSearch/hooks/useDocumentAggregateResponse';
import { BatchedDocumentsFilters } from 'modules/documentSearch/types';
import { getEmptyDocumentCategories } from 'modules/documentSearch/utils';
import { getAvailableDocumentCategories } from 'modules/documentSearch/utils/getAvailableDocumentCategories';

import { useRelatedDocumentFilterQuery } from './useRelatedDocumentFilterQuery';
import { useRelatedDocumentResultFacetsQuery } from './useRelatedDocumentResultFacetsQuery';

export const useRelatedDocumentCategories = (
  batchedDocumentsFilters?: BatchedDocumentsFilters
) => {
  const { data } = useRelatedDocumentResultFacetsQuery();
  const filterQuery = useRelatedDocumentFilterQuery();
  const aggregateResponse = useDocumentAggregateResponse(
    filterQuery,
    batchedDocumentsFilters
  );

  const emptyDocumentCategories = getEmptyDocumentCategories();

  return useDeepMemo(() => {
    if (!data || 'error' in data) {
      return emptyDocumentCategories;
    }

    return getAvailableDocumentCategories(
      {
        ...emptyDocumentCategories,
        ...data,
      },
      aggregateResponse
    );
  }, [data, aggregateResponse]);
};
