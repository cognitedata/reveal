import { fetchGet, FetchHeaders, fetchPost } from 'utils/fetch';

import {
  WellEventLegendListResponse,
  WellEventLegendCreateBody,
  WellEventLegendCreateResponse,
} from '@cognite/discover-api-types';

import { SIDECAR } from 'constants/app';

import { WellLegendNptType } from '../types';

const getNptLegendEndpoint = (
  project: string,
  type: WellLegendNptType,
  id?: string
) =>
  `${SIDECAR.discoverApiBaseUrl}/${project}/well/legend/npt/${type}${
    id ? `/${id}` : ''
  }`;

export const nptLegend = {
  list: async (
    headers: FetchHeaders,
    project: string,
    type: WellLegendNptType
  ) =>
    fetchGet<WellEventLegendListResponse>(getNptLegendEndpoint(project, type), {
      headers,
    }),
  create: async (
    headers: FetchHeaders,
    project: string,
    type: WellLegendNptType,
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
