import { SearchRequestOptions } from 'domain/documents/service/queries/searchDocument';

import { useWellInspectSelectedWellboreIds } from 'modules/wellInspect/hooks/useWellInspect';

export const useRelatedDocumentsFilter = () => {
  const wellboreIds = useWellInspectSelectedWellboreIds();

  const relatedDocumentFilters: SearchRequestOptions = {
    filter: {
      and: [
        {
          containsAny: {
            property: ['assetExternalIds'],
            values: wellboreIds,
          },
        },
      ],
    },
    sort: [],
  };

  return relatedDocumentFilters;
};
