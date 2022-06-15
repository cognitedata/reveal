import { getFavorites } from 'domain/favorites/service/network/getFavorites';

import { useQuery, UseQueryResult } from 'react-query';

import { getProjectInfo } from '@cognite/react-container';

import { FAVORITE_KEY } from 'constants/react-query';
import { useJsonHeaders } from 'hooks/useJsonHeaders';
import { FavoriteSummary, normalizeFavorite } from 'modules/favorite/types';

export function useFavoritesQuery(): UseQueryResult<FavoriteSummary[]> {
  const headers = useJsonHeaders({}, true);
  const [tenant] = getProjectInfo();

  return useQuery(
    FAVORITE_KEY.ALL_FAVORITES,
    () =>
      getFavorites(headers, tenant).then((data) => data.map(normalizeFavorite)) // favorites are sorted in the backend by lastUpdatedBy
  );
}
