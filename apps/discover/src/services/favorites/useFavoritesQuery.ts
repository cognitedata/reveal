import { useQuery, UseQueryResult } from 'react-query';

import cloneDeep from 'lodash/cloneDeep';
import { sortByCaseInsensitive } from 'utils/sort';

import { getTenantInfo } from '@cognite/react-container';

import { FAVORITE_KEY } from 'constants/react-query';
import { FavoriteSummary, normalizeFavorite } from 'modules/favorite/types';

import { discoverAPI, useJsonHeaders } from '../service';

export type FavoriteStatus = 'error' | 'loading' | 'ok';
export interface FavoriteSet {
  status: FavoriteStatus;
  favorites: FavoriteSummary[];
}

export function useFavoritesGetOneQuery(
  id: string
): UseQueryResult<FavoriteSummary> {
  const headers = useJsonHeaders({}, true);
  const [tenant] = getTenantInfo();

  return useQuery([...FAVORITE_KEY.FAVORITES, id], () =>
    discoverAPI.favorites
      .getOne(id, headers, tenant)
      .then((data) => normalizeFavorite(data) as FavoriteSummary)
  );
}

export function useFavoritesGetAllQuery(): UseQueryResult<FavoriteSummary[]> {
  const headers = useJsonHeaders({}, true);
  const [tenant] = getTenantInfo();

  return useQuery(
    FAVORITE_KEY.ALL_FAVORITES,
    () =>
      discoverAPI.favorites
        .list(headers, tenant)
        .then((data) => data.map((item) => normalizeFavorite(item))) // favorites are sorted in the backend by lastUpdatedBy
  );
}

export function useFavoritesSortedByName() {
  const result = useFavoritesGetAllQuery();

  return {
    ...result,
    data: result.data
      ? cloneDeep(result.data).sort((a, b) =>
          sortByCaseInsensitive(a.name, b.name)
        )
      : result.data,
  };
}
