import { useMemo } from 'react';

import uniq from 'lodash/uniq';
import { useFavoritesGetAllQuery } from 'services/favorites/useFavoritesQuery';

export const useFavoriteDocumentIds = (): number[] => {
  const { data: favoriteSets } = useFavoritesGetAllQuery();

  return useMemo(() => {
    if (!favoriteSets || 'error' in favoriteSets) {
      return [];
    }

    return uniq(
      favoriteSets.flatMap((favoriteSet) => favoriteSet.content.documentIds)
    );
  }, [favoriteSets]);
};
