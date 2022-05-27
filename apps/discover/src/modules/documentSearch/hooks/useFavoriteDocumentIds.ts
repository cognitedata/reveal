import { useFavoritesQuery } from 'domain/favorites/internal/queries/useFavoritesQuery';

import { useMemo } from 'react';

import uniq from 'lodash/uniq';

export const useFavoriteDocumentIds = (): number[] => {
  const { data: favoriteSets } = useFavoritesQuery();

  return useMemo(() => {
    if (!favoriteSets || 'error' in favoriteSets) {
      return [];
    }

    return uniq(
      favoriteSets.flatMap((favoriteSet) => favoriteSet.content.documentIds)
    );
  }, [favoriteSets]);
};
