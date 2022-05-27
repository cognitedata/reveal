import { FetchHeaders, fetchPatch } from 'utils/fetch';

import { FavoritePatchSchema } from '@cognite/discover-api-types';

import { getFavoritesEndpoint } from '../utils/getFavoritesEndpoint';

export const updateFavorite = async (
  favoriteId: string,
  body: FavoritePatchSchema,
  headers: FetchHeaders,
  project: string
) =>
  fetchPatch(`${getFavoritesEndpoint(project)}/${favoriteId}`, body, {
    headers,
  });
