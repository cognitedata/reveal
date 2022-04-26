import { rest } from 'msw';
import { getNptLegendEndpoint } from 'services/well/legend/npt/service';
import { TEST_PROJECT } from 'setupTests';

import { WellEventLegendListResponse } from '@cognite/discover-api-types';

import { MSWRequest } from '__test-utils/types';

import { WellLegendNptType } from '../legend/types';

const responseData: WellEventLegendListResponse = { items: [] };

export const getMockWellLegendGet = (): MSWRequest => {
  const url = getNptLegendEndpoint(TEST_PROJECT, WellLegendNptType.Code);

  // console.log('STARTING MOCK', url);

  return rest.get<Request>(url, (_req, res, ctx) => {
    return res(ctx.json(responseData));
  });
};
