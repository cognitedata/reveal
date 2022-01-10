import {
  FavoriteDetails,
  FavoritePostSchema,
  FavoriteSummary,
} from '@cognite/discover-api-types';

import { SIDECAR } from '../../../constants/app';
import {
  fetchDelete,
  fetchGet,
  FetchHeaders,
  fetchPatch,
  fetchPost,
} from '../../../utils/fetch';
import {
  UpdateFavoriteContentData,
  UpdateFavoriteData,
} from '../../favorite/types';

const getFavoritesEndpoint = (project: string) =>
  `${SIDECAR.discoverApiBaseUrl}/${project}/favorites`;

export const favorites = {
  create: async (
    payload: FavoritePostSchema,
    headers: FetchHeaders,
    project: string
  ) =>
    fetchPost<string>(getFavoritesEndpoint(project), payload, {
      headers,
    }),

  update: async (
    data: UpdateFavoriteData,
    headers: FetchHeaders,
    project: string
  ) =>
    fetchPatch(`${getFavoritesEndpoint(project)}/${data.id}`, data.updateData, {
      headers,
    }),

  updateFavoriteContent: async (
    payload: UpdateFavoriteContentData,
    headers: FetchHeaders,
    project: string
  ) =>
    fetchPatch(
      `${getFavoritesEndpoint(project)}/${payload.id}/content`,
      payload.updateData,
      { headers }
    ),

  getOne: async (id: string, headers: FetchHeaders, project: string) =>
    fetchGet<FavoriteDetails>(`${getFavoritesEndpoint(project)}/${id}`, {
      headers,
    }),

  list: async (headers: FetchHeaders, project: string) =>
    fetchGet<FavoriteSummary[]>(getFavoritesEndpoint(project), {
      headers,
    }),

  delete: async <T>(id: string, headers: FetchHeaders, project: string) =>
    fetchDelete<T>(`${getFavoritesEndpoint(project)}/${id}`, {
      headers,
    }),

  duplicate: async <T>(
    id: string,
    payload: FavoritePostSchema,
    headers: FetchHeaders,
    project: string
  ) =>
    fetchPost<T>(`${getFavoritesEndpoint(project)}/duplicate/${id}`, payload, {
      headers,
    }),

  share: async <T>(
    favoriteId: string,
    userIds: string[],
    headers: FetchHeaders,
    project: string
  ) =>
    fetchPost<T>(
      `${getFavoritesEndpoint(project)}/share`,
      {
        id: favoriteId,
        shareWithUsers: userIds,
      },
      { headers }
    ),

  removeShare: async <T>(
    favoriteId: string,
    user: string,
    headers: FetchHeaders,
    project: string
  ) =>
    fetchPost<T>(
      `${getFavoritesEndpoint(project)}/removeshare`,
      {
        id: favoriteId,
        user,
      },
      { headers }
    ),
};
