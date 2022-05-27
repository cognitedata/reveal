import { fetchDelete, FetchHeaders } from 'utils/fetch';

import { getFavoritesEndpoint } from '../utils/getFavoritesEndpoint';

export const deleteFavorite = async <T>(
  id: string,
  headers: FetchHeaders,
  project: string
) =>
  fetchDelete<T>(`${getFavoritesEndpoint(project)}/${id}`, {
    headers,
  });
