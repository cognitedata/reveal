import { createFavorite } from 'domain/favorites/service/network/createFavorite';
import { deleteFavorite } from 'domain/favorites/service/network/deleteFavorite';
import { duplicateFavorite } from 'domain/favorites/service/network/duplicateFavorite';
import { removeShareFavorite } from 'domain/favorites/service/network/removeShareFavorite';
import { shareFavorite } from 'domain/favorites/service/network/shareFavorite';
import { updateFavorite } from 'domain/favorites/service/network/updateFavorite';
import { updateFavoriteContent } from 'domain/favorites/service/network/updateFavoriteContent';

import { useMutation, useQueryClient } from 'react-query';

import { FavoritePostSchema } from '@cognite/discover-api-types';
import { getTenantInfo } from '@cognite/react-container';
import { reportException } from '@cognite/react-errors';

import { showErrorMessage } from 'components/Toast';
import { SOMETHING_WENT_WRONG_PLEASE_TRY_AGAIN } from 'constants/error';
import { FAVORITE_KEY } from 'constants/react-query';
import { useJsonHeaders } from 'hooks/useJsonHeaders';
import {
  FavoriteSummary,
  UpdateFavoriteContentData,
  UpdateFavoriteData,
} from 'modules/favorite/types';

const handleErrorResponse = (error: any) => {
  showErrorMessage(SOMETHING_WENT_WRONG_PLEASE_TRY_AGAIN);
  reportException(error);
};

export function useFavoritesCreateMutate() {
  const headers = useJsonHeaders({}, true);
  const queryClient = useQueryClient();
  const [tenant] = getTenantInfo();

  return useMutation(
    (payload: FavoritePostSchema) => createFavorite(payload, headers, tenant),
    {
      onSuccess: () => {
        return queryClient.invalidateQueries(FAVORITE_KEY.ALL_FAVORITES);
      },
      onError: handleErrorResponse,
    }
  );
}

export function useFavoriteDuplicateMutate() {
  const headers = useJsonHeaders({}, true);
  const queryClient = useQueryClient();
  const [tenant] = getTenantInfo();

  return useMutation(
    (data: { id: string; payload: FavoritePostSchema }) =>
      duplicateFavorite(data.id, data.payload, headers, tenant),
    {
      onSuccess: () => {
        return queryClient.invalidateQueries(FAVORITE_KEY.ALL_FAVORITES);
      },
      onError: handleErrorResponse,
    }
  );
}

export function useFavoritesUpdateMutate() {
  const headers = useJsonHeaders({}, true);
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

      return updateFavorite(data.id, data.updateData, headers, tenant);
    },

    {
      onSuccess: () => {
        return queryClient.invalidateQueries(FAVORITE_KEY.ALL_FAVORITES);
      },
      onError: (error, variables) => {
        queryClient.invalidateQueries([
          ...FAVORITE_KEY.FAVORITES,
          variables.id,
        ]);
        handleErrorResponse(error);
      },
    }
  );
}

export function useFavoriteUpdateContent() {
  const headers = useJsonHeaders({}, true);
  const queryClient = useQueryClient();
  const [tenant] = getTenantInfo();

  return useMutation(
    (data: UpdateFavoriteContentData) =>
      updateFavoriteContent(data.id, data.updateData, headers, tenant),
    {
      onSettled: (_data, _error, variables) => {
        queryClient.invalidateQueries([
          ...FAVORITE_KEY.FAVORITES,
          variables.id,
        ]);
        return queryClient.invalidateQueries(FAVORITE_KEY.ALL_FAVORITES);
      },
      onError: handleErrorResponse,
    }
  );
}

export function useFavoritesDeleteMutate() {
  const headers = useJsonHeaders({}, true);
  const [tenant] = getTenantInfo();
  const queryClient = useQueryClient();

  return useMutation(
    (favoriteId: string) => deleteFavorite(favoriteId, headers, tenant),
    {
      onSuccess: () => {
        return queryClient.invalidateQueries(FAVORITE_KEY.ALL_FAVORITES);
      },
      onError: handleErrorResponse,
    }
  );
}

export function useFavoriteShareMutate() {
  const headers = useJsonHeaders({}, true);
  const [tenant] = getTenantInfo();
  const queryClient = useQueryClient();

  return useMutation(
    (data: { favoriteId: string; userIds: string[] }) =>
      shareFavorite(
        {
          id: data.favoriteId,
          shareWithUsers: data.userIds,
        },
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
      onError: handleErrorResponse,
    }
  );
}

export function useFavoriteRemoveShareMutate() {
  const headers = useJsonHeaders({}, true);
  const [tenant] = getTenantInfo();
  const queryClient = useQueryClient();

  return useMutation(
    (data: { favoriteId: string; user: string }) =>
      removeShareFavorite(
        {
          id: data.favoriteId,
          user: data.user,
        },
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
      onError: handleErrorResponse,
    }
  );
}
