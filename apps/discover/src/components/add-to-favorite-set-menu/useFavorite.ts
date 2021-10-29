import { useMemo } from 'react';

import { useGlobalMetrics } from 'hooks/useGlobalMetrics';
import { useFavoriteUpdateContent } from 'modules/api/favorites/useFavoritesQuery';
import { FavoriteContentWells, FavoriteSummary } from 'modules/favorite/types';

export function useDocumentExistInFavorite(
  favorites: FavoriteSummary[],
  documentId: number
) {
  return useMemo(() => {
    return favorites
      .filter((favorite) =>
        favorite.content.documentIds.includes(Number(documentId))
      )
      .map((favorite) => favorite.id);
  }, [favorites, documentId]);
}

export function useWellExistInFavorite(
  favorites: FavoriteSummary[],
  wellId: number
) {
  return useMemo(() => {
    return favorites
      .filter((favorite) =>
        Object.keys(favorite.content.wells).includes(String(wellId))
      )
      .map((favorite) => favorite.id);
  }, [favorites, wellId]);
}

export const getWellIds = (wellId?: number) => (wellId ? [wellId] : []);

export const getDocumentIds = (documentId?: number) =>
  documentId ? [documentId] : [];

export const useHandleSelectFavourite = () => {
  const { mutateAsync } = useFavoriteUpdateContent();
  const metrics = useGlobalMetrics('favorites');

  const handleFavoriteUpdate = (
    setId: string,
    documentIds: number[],
    wells: FavoriteContentWells | undefined,
    documentSuccess: () => void,
    wellSuccess: () => void
  ) => {
    if (documentIds && documentIds.length) {
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
