import { getFavorite } from 'domain/favorites/service/network/getFavorite';

import { useQuery, UseQueryResult } from 'react-query';

import { getProjectInfo } from '@cognite/react-container';

import { FAVORITE_KEY } from 'constants/react-query';
import { useJsonHeaders } from 'hooks/useJsonHeaders';
import { FavoriteSummary, normalizeFavorite } from 'modules/favorite/types';

export function useFavoriteQuery(id: string): UseQueryResult<FavoriteSummary> {
  const headers = useJsonHeaders({}, true);
  const [tenant] = getProjectInfo();

  return useQuery([...FAVORITE_KEY.FAVORITES, id], () =>
    getFavorite(id, headers, tenant).then(
      (data) => normalizeFavorite(data) as FavoriteSummary
    )
  );
}
