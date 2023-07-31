import { WellLegendNptType } from 'domain/wells/legend/internal/types';
import { getNptLegendEndpoint } from 'domain/wells/legend/service/network/getNptLegendEndpoint';

import { FetchHeaders, fetchPost } from 'utils/fetch';

import {
  WellEventLegendCreateBody,
  WellEventLegendCreateResponse,
} from '@cognite/discover-api-types';

export const nptCreateLegend = async (
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
  );
