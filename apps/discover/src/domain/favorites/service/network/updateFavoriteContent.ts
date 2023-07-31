import { FetchHeaders, fetchPatch } from 'utils/fetch';

import { FavoritePatchContentSchema } from '@cognite/discover-api-types';

import { getFavoritesEndpoint } from '../utils/getFavoritesEndpoint';
import { mapWellboreIdsToString } from '../utils/mapWellboreIdsToString';

export const updateFavoriteContent = async (
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
  );
