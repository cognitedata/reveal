import { SearchRequestOptions } from 'domain/documents/service/network/searchDocument';
import { useWellInspectSelectedWellboreIds } from 'domain/wells/well/internal/hooks/useWellInspectSelectedWellboreIds';

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
