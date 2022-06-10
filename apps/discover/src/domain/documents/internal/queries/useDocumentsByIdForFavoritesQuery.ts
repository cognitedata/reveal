import { normalize } from 'domain/documents/internal/transformers/normalize';

import { useInfiniteQuery } from 'react-query';

import chunk from 'lodash/chunk';

import { MAX_FILTER_ITEMS_COUNT } from 'constants/app';
import { DOCUMENTS_BY_IDS_QUERY_KEY } from 'constants/react-query';
import { documentSearchService } from 'modules/documentSearch/service';

export const useDocumentsByIdForFavoritesQuery = (
  documentIds: number[] | undefined
) => {
  const chunkedIds = chunk(documentIds || [], MAX_FILTER_ITEMS_COUNT);

  return useInfiniteQuery(
    [...DOCUMENTS_BY_IDS_QUERY_KEY, documentIds],
    ({ pageParam = 0 }) => {
      if (documentIds && documentIds.length) {
        return documentSearchService
          .documentsByIds(chunkedIds[pageParam])
          .then((result) => {
            return result.items.map(({ item }) => {
              return normalize(item);
            });
          });
      }

      return [];
    },
    {
      enabled: documentIds !== undefined,
    }
  );
};
