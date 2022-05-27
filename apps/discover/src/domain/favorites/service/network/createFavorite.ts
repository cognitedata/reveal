import { FetchHeaders, fetchPost } from 'utils/fetch';

import { FavoritePostSchema } from '@cognite/discover-api-types';

import { getFavoritesEndpoint } from '../utils/getFavoritesEndpoint';
import { mapWellboreIdsToString } from '../utils/mapWellboreIdsToString';

export const createFavorite = async (
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
  );
