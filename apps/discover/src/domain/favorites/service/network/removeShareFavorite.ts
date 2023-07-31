import { FetchHeaders, fetchPost } from 'utils/fetch';

import { FavoriteRemoveSharePostSchema } from '@cognite/discover-api-types';

import { getFavoritesEndpoint } from '../utils/getFavoritesEndpoint';

export const removeShareFavorite = async <T>(
  body: FavoriteRemoveSharePostSchema,
  headers: FetchHeaders,
  project: string
) =>
  fetchPost<T>(`${getFavoritesEndpoint(project)}/removeshare`, body, {
    headers,
  });
