import { useRelatedDocumentsFilter } from 'modules/documentSearch/hooks/useRelatedDocumentsFilter';
import { useRelatedDocumentFilterQuery } from 'modules/wellSearch/selectors/relatedDocuments/hooks/useRelatedDocumentFilterQuery';

import { InifniteQueryResponse } from './types';
import { useDocumentSearchQuery } from './useDocumentSearchQuery';

export const useDocumentSearchRelatedDocumentsQuery =
  (): InifniteQueryResponse => {
    const filterQuery = useRelatedDocumentFilterQuery();
    const relatedDocumentFilter = useRelatedDocumentsFilter();

    return useDocumentSearchQuery(filterQuery, relatedDocumentFilter);
  };
