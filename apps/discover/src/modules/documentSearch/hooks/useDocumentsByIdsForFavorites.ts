import { useInfiniteQuery } from 'react-query';

import chunk from 'lodash/chunk';

import { MAX_FILTER_ITEMS_COUNT } from 'constants/app';
import { DOCUMENTS_BY_IDS_QUERY_KEY } from 'constants/react-query';
import { documentSearchService } from 'modules/documentSearch/service';
import { mapAPIResultDocumentSearchItemToFavoriteDocumentData } from 'modules/favorite/types';

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
              return mapAPIResultDocumentSearchItemToFavoriteDocumentData(item);
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
