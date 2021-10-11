import {
  useMutation,
  useQuery,
  useQueryClient,
  UseQueryResult,
} from 'react-query';

import { FavoritePostSchema } from '@cognite/discover-api-types';
import { getTenantInfo } from '@cognite/react-container';

import { FAVORITE_KEY } from 'constants/react-query';
import { discoverAPI, getJsonHeaders } from 'modules/api/service';
import {
  FavoriteSummary,
  normalizeFavorite,
  UpdateFavoriteContentData,
  UpdateFavoriteData,
} from 'modules/favorite/types';

export type FavoriteStatus = 'error' | 'loading' | 'ok';
export interface FavoriteSet {
  status: FavoriteStatus;
  favorites: FavoriteSummary[];
}

export function useFavoritesCreateMutate() {
  const headers = getJsonHeaders({}, true);
  const queryClient = useQueryClient();
  const [tenant] = getTenantInfo();

  return useMutation(
    (payload: FavoritePostSchema) =>
      discoverAPI.favorites.create(payload, headers, tenant),
    {
      onSuccess: () => {
        return queryClient.invalidateQueries(FAVORITE_KEY.ALL_FAVORITES);
      },
    }
  );
}

export function useFavoriteDuplicateMutate() {
  const headers = getJsonHeaders({}, true);
  const queryClient = useQueryClient();
  const [tenant] = getTenantInfo();

  return useMutation(
    (data: { id: string; payload: FavoritePostSchema }) =>
      discoverAPI.favorites.duplicate(data.id, data.payload, headers, tenant),
    {
      onSuccess: () => {
        return queryClient.invalidateQueries(FAVORITE_KEY.ALL_FAVORITES);
      },
    }
  );
}

export function useFavoritesUpdateMutate() {
  const headers = getJsonHeaders({}, true);
  const queryClient = useQueryClient();
  const [tenant] = getTenantInfo();

  return useMutation(
    (data: UpdateFavoriteData) => {
      // optimistic update
      const oldFavoriteData: FavoriteSummary | undefined =
        queryClient.getQueryData([...FAVORITE_KEY.FAVORITES, data.id]);

      if (oldFavoriteData) {
        queryClient.setQueryData([...FAVORITE_KEY.FAVORITES, data.id], {
          ...oldFavoriteData,
          name: data.updateData.name
            ? data.updateData.name
            : oldFavoriteData.name,
          description: data.updateData.description
            ? data.updateData.description
            : oldFavoriteData.description,
        });
      }

      return discoverAPI.favorites.update(data, headers, tenant);
    },

    {
      onSuccess: () => {
        return queryClient.invalidateQueries(FAVORITE_KEY.ALL_FAVORITES);
      },
      onError: (_error, variables) => {
        queryClient.invalidateQueries([
          ...FAVORITE_KEY.FAVORITES,
          variables.id,
        ]);
      },
    }
  );
}

export function useFavoriteUpdateContent() {
  const headers = getJsonHeaders({}, true);
  const queryClient = useQueryClient();
  const [tenant] = getTenantInfo();

  return useMutation(
    (data: UpdateFavoriteContentData) =>
      discoverAPI.favorites.updateFavoriteContent(data, headers, tenant),
    {
      onSettled: (_data, _error, variables) => {
        queryClient.invalidateQueries([
          ...FAVORITE_KEY.FAVORITES,
          variables.id,
        ]);
        return queryClient.invalidateQueries(FAVORITE_KEY.ALL_FAVORITES);
      },
    }
  );
}

export function useFavoritesDeleteMutate() {
  const headers = getJsonHeaders({}, true);
  const [tenant] = getTenantInfo();
  const queryClient = useQueryClient();

  return useMutation(
    (id: string) => discoverAPI.favorites.delete(id, headers, tenant),
    {
      onSuccess: () => {
        return queryClient.invalidateQueries(FAVORITE_KEY.ALL_FAVORITES);
      },
    }
  );
}

export function useFavoriteShareMutate() {
  const headers = getJsonHeaders({}, true);
  const [tenant] = getTenantInfo();
  const queryClient = useQueryClient();

  return useMutation(
    (data: { favoriteId: string; userIds: string[] }) =>
      discoverAPI.favorites.share(
        data.favoriteId,
        data.userIds,
        headers,
        tenant
      ),
    {
      onSettled: (_data, _error, variables) => {
        queryClient.invalidateQueries([
          ...FAVORITE_KEY.FAVORITES,
          variables.favoriteId,
        ]);
        return queryClient.invalidateQueries(FAVORITE_KEY.ALL_FAVORITES);
      },
    }
  );
}

export function useFavoriteRemoveShareMutate() {
  const headers = getJsonHeaders({}, true);
  const [tenant] = getTenantInfo();
  const queryClient = useQueryClient();

  return useMutation(
    (data: { favoriteId: string; user: string }) =>
      discoverAPI.favorites.removeShare(
        data.favoriteId,
        data.user,
        headers,
        tenant
      ),
    {
      onSettled: (_data, _error, variables) => {
        return queryClient.invalidateQueries([
          ...FAVORITE_KEY.FAVORITES,
          variables.favoriteId,
        ]);
      },
    }
  );
}

export function useFavoritesGetOneQuery(
  id: string
): UseQueryResult<FavoriteSummary> {
  const headers = getJsonHeaders({}, true);
  const [tenant] = getTenantInfo();

  return useQuery([...FAVORITE_KEY.FAVORITES, id], () =>
    discoverAPI.favorites
      .getOne(id, headers, tenant)
      .then((data) => normalizeFavorite(data) as FavoriteSummary)
  );
}

export function useFavoritesGetAllQuery(): UseQueryResult<FavoriteSummary[]> {
  const headers = getJsonHeaders({}, true);
  const [tenant] = getTenantInfo();

  return useQuery(FAVORITE_KEY.ALL_FAVORITES, () =>
    discoverAPI.favorites
      .list(headers, tenant)
      .then((data) => data.map((item) => normalizeFavorite(item)))
  );
}
