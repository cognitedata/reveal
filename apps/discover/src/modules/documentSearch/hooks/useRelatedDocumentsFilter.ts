import { SearchRequestOptions } from 'domain/documents/service/network/searchDocument';
import { LIMIT_WELLBORES_NUMBER } from 'domain/wells/constants';

import { useWellInspectSelectedWellboreIds } from 'modules/wellInspect/selectors';

export const useRelatedDocumentsFilter = () => {
  const wellboreIds = useWellInspectSelectedWellboreIds();

  const relatedDocumentFilters: SearchRequestOptions = {
    filter: {
      and: [
        {
          containsAny: {
            property: ['assetExternalIds'],
            values: wellboreIds.slice(0, LIMIT_WELLBORES_NUMBER),
          },
        },
      ],
    },
    sort: [],
  };

  return relatedDocumentFilters;
};
