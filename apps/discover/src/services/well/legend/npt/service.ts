import { fetchGet, FetchHeaders, fetchPost } from 'utils/fetch';

import {
  SearchHistoryResponse,
  WellEventLegendCreateBody,
  WellEventLegendCreateResponse,
} from '@cognite/discover-api-types';

import { SIDECAR } from 'constants/app';

import { WellLegendType } from '../types';

const getNptLegendEndpoint = (
  project: string,
  type: WellLegendType,
  id?: string
) => `${SIDECAR.discoverApiBaseUrl}/${project}/well/npt/${type}/${id}`;

export const nptLegend = {
  list: async (headers: FetchHeaders, project: string, type: WellLegendType) =>
    fetchGet<SearchHistoryResponse[]>(getNptLegendEndpoint(project, type), {
      headers,
    }),
  create: async (
    headers: FetchHeaders,
    project: string,
    type: WellLegendType,
    id: string,
    body: WellEventLegendCreateBody
  ) =>
    fetchPost<WellEventLegendCreateResponse>(
      getNptLegendEndpoint(project, type, id),
      body,
      {
        headers,
      }
    ),
};
