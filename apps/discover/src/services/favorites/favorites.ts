import {
  FavoriteDetails,
  FavoritePatchContentSchema,
  FavoritePatchSchema,
  FavoritePostSchema,
  FavoriteRemoveSharePostSchema,
  FavoriteSharePostSchema,
  FavoriteSummary,
} from '@cognite/discover-api-types';

import { FavoriteContentWells } from 'modules/favorite/types';

import { SIDECAR } from '../../constants/app';
import {
  fetchDelete,
  fetchGet,
  FetchHeaders,
  fetchPatch,
  fetchPost,
} from '../../utils/fetch';

const getFavoritesEndpoint = (project: string) =>
  `${SIDECAR.discoverApiBaseUrl}/${project}/favorites`;

const mapWellboreIdsToString = (
  wells: FavoriteContentWells | undefined
): FavoriteContentWells | undefined => {
  return wells
    ? Object.keys(wells || {}).reduce((current, wellId) => {
        return {
          ...current,
          [wellId]: wells[wellId].map((wellboreId) => String(wellboreId)),
        };
      }, {})
    : undefined;
};

export const favorites = {
  create: async (
    payload: FavoritePostSchema,
    headers: FetchHeaders,
    project: string
  ) =>
    fetchPost<string>(
      getFavoritesEndpoint(project),
      {
        ...payload,
        content: {
          ...payload.content,
          wells: mapWellboreIdsToString(payload.content?.wells),
        },
      },
      {
        headers,
      }
    ),

  update: async (
    favoriteId: string,
    body: FavoritePatchSchema,
    headers: FetchHeaders,
    project: string
  ) =>
    fetchPatch(`${getFavoritesEndpoint(project)}/${favoriteId}`, body, {
      headers,
    }),

  updateFavoriteContent: async (
    favoriteId: string,
    body: FavoritePatchContentSchema,
    headers: FetchHeaders,
    project: string
  ) =>
    fetchPatch(
      `${getFavoritesEndpoint(project)}/${favoriteId}/content`,
      {
        ...body,
        wells: mapWellboreIdsToString(body.wells),
      },
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
    body: FavoritePostSchema,
    headers: FetchHeaders,
    project: string
  ) =>
    fetchPost<T>(`${getFavoritesEndpoint(project)}/duplicate/${id}`, body, {
      headers,
    }),

  share: async <T>(
    body: FavoriteSharePostSchema,
    headers: FetchHeaders,
    project: string
  ) =>
    fetchPost<T>(`${getFavoritesEndpoint(project)}/share`, body, { headers }),

  removeShare: async <T>(
    body: FavoriteRemoveSharePostSchema,
    headers: FetchHeaders,
    project: string
  ) =>
    fetchPost<T>(`${getFavoritesEndpoint(project)}/removeshare`, body, {
      headers,
    }),
};
