import { fetchGet, FetchHeaders } from 'utils/fetch';

import { FavoriteDetails } from '@cognite/discover-api-types';

import { getFavoritesEndpoint } from '../utils/getFavoritesEndpoint';

export const getFavorite = async (
  id: string,
  headers: FetchHeaders,
  project: string
) =>
  fetchGet<FavoriteDetails>(`${getFavoritesEndpoint(project)}/${id}`, {
    headers,
  });
