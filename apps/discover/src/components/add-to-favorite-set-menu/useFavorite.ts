import { useMemo } from 'react';

import isEmpty from 'lodash/isEmpty';
import { useFavoriteUpdateContent } from 'services/favorites/useFavoritesMutate';

import { useDeepMemo } from 'hooks/useDeep';
import { useGlobalMetrics } from 'hooks/useGlobalMetrics';
import { FavoriteContentWells, FavoriteSummary } from 'modules/favorite/types';
import {
  getDocumentExistInFavorite,
  getWellsWellboresExistInFavorite,
} from 'modules/favorite/utils';
import { WellboreId, WellId } from 'modules/wellSearch/types';

export function useDocumentExistInFavorite(
  favorites: FavoriteSummary[],
  documentId: number
) {
  return useMemo(() => {
    return getDocumentExistInFavorite(favorites, documentId);
  }, [favorites, documentId]);
}

export const useWellExistInFavorite = (
  favorites: FavoriteSummary[],
  wellId: WellId,
  wellboreId?: WellboreId
): string[] => {
  return useDeepMemo(() => {
    return getWellsWellboresExistInFavorite(favorites, wellId, wellboreId);
  }, [favorites, wellId, wellboreId]);
};

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
