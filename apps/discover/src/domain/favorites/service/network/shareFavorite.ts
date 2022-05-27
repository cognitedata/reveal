import { FetchHeaders, fetchPost } from 'utils/fetch';

import { FavoriteSharePostSchema } from '@cognite/discover-api-types';

import { getFavoritesEndpoint } from '../utils/getFavoritesEndpoint';

export const shareFavorite = async <T>(
  body: FavoriteSharePostSchema,
  headers: FetchHeaders,
  project: string
) => fetchPost<T>(`${getFavoritesEndpoint(project)}/share`, body, { headers });
