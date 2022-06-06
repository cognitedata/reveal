import { WellLegendNptType } from 'domain/wells/legend/internal/types';
import { getNptLegendEndpoint } from 'domain/wells/legend/service/network/getNptLegendEndpoint';

import { fetchGet, FetchHeaders } from 'utils/fetch';

import { WellEventLegendListResponse } from '@cognite/discover-api-types';

export const nptListLegend = async (
  headers: FetchHeaders,
  project: string,
  type: WellLegendNptType
) =>
  fetchGet<WellEventLegendListResponse>(getNptLegendEndpoint(project, type), {
    headers,
  });
