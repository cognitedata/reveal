import { SearchRequestOptions } from 'domain/documents/service/network/searchDocument';
import { LIMIT_WELLBORES_NUMBER } from 'domain/wells/constants';
import { useWellInspectSelectedWellboresExternalIds } from 'domain/wells/well/internal/hooks/useWellInspectSelectedWellboresExternalIds';

import isEmpty from 'lodash/isEmpty';

import { EMPTY_OBJECT } from 'constants/empty';

export const useRelatedDocumentsFilter = (): SearchRequestOptions => {
  const assetExternalIds = useWellInspectSelectedWellboresExternalIds();

  if (isEmpty(assetExternalIds)) {
    return EMPTY_OBJECT;
  }

  const relatedDocumentFilters: SearchRequestOptions = {
    filter: {
      and: [
        {
          containsAny: {
            property: ['assetExternalIds'],
            values: assetExternalIds.slice(0, LIMIT_WELLBORES_NUMBER),
          },
        },
      ],
    },
    sort: [],
  };

  return relatedDocumentFilters;
};
