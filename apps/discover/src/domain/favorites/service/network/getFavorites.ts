import { fetchGet, FetchHeaders } from 'utils/fetch';

import { FavoriteSummary } from '@cognite/discover-api-types';

import { getFavoritesEndpoint } from '../utils/getFavoritesEndpoint';

export const getFavorites = async (headers: FetchHeaders, project: string) =>
  fetchGet<FavoriteSummary[]>(getFavoritesEndpoint(project), {
    headers,
  });
