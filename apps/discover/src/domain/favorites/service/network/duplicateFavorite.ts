import { FetchHeaders, fetchPost } from 'utils/fetch';

import { FavoritePostSchema } from '@cognite/discover-api-types';

import { getFavoritesEndpoint } from '../utils/getFavoritesEndpoint';

export const duplicateFavorite = async <T>(
  id: string,
  body: FavoritePostSchema,
  headers: FetchHeaders,
  project: string
) =>
  fetchPost<T>(`${getFavoritesEndpoint(project)}/duplicate/${id}`, body, {
    headers,
  });
