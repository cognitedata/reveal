import { useRelatedDocumentsFilter } from 'modules/documentSearch/hooks/useRelatedDocumentsFilter';
import { getFilterQuery } from 'modules/wellSearch/selectors/relatedDocuments/hooks/useRelatedDocumentFilterQuery';

import { InifniteQueryResponse } from './types';
import { useDocumentSearchQuery } from './useDocumentSearchQuery';

// only filter on related documents, do not add any other filters
// this is used at the base selector for all the search options
export const useDocumentSearchRelatedDocumentsOnlyQuery =
  (): InifniteQueryResponse => {
    const relatedDocumentFilter = useRelatedDocumentsFilter();

    return useDocumentSearchQuery(getFilterQuery(), relatedDocumentFilter);
  };
