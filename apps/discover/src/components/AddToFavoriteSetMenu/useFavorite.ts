import { useFavoriteUpdateContent } from 'domain/favorites/internal/actions/useFavoritesMutate';

import { useMemo } from 'react';

import isEmpty from 'lodash/isEmpty';

import { useGlobalMetrics } from 'hooks/useGlobalMetrics';
import { FavoriteContentWells, FavoriteSummary } from 'modules/favorite/types';
import { getDocumentExistInFavorite } from 'modules/favorite/utils';

export function useDocumentExistInFavorite(
  favorites: FavoriteSummary[],
  documentId: number
) {
  return useMemo(() => {
    return getDocumentExistInFavorite(favorites, documentId);
  }, [favorites, documentId]);
}

export const useHandleSelectFavourite = () => {
  const { mutateAsync } = useFavoriteUpdateContent();
  const metrics = useGlobalMetrics('favorites');

  const handleFavoriteUpdate = (
    setId: string,
    documentIds: number[] | undefined,
    wells: FavoriteContentWells | undefined,
    documentSuccess: () => void,
    wellSuccess: () => void
  ) => {
    if (documentIds && !isEmpty(documentIds)) {
      metrics.track('click-add-documents-to-set');

      mutateAsync({
        id: setId,
        updateData: {
          addDocumentIds: documentIds,
        },
      }).then(() => {
        documentSuccess();
      });
    }

    if (wells) {
      metrics.track('click-add-wells-to-set');

      mutateAsync({
        id: setId,
        updateData: {
          wells,
        },
      }).then(() => {
        wellSuccess();
      });
    }
  };

  return { handleFavoriteUpdate };
};
