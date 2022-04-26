import { rest } from 'msw';
import { getNptLegendEndpoint } from 'services/well/legend/npt/service';
import { TEST_PROJECT } from 'setupTests';

import { WellEventLegendCreateResponse } from '@cognite/discover-api-types';

import { MSWRequest } from '__test-utils/types';

import { WellLegendNptType } from '../legend/types';

const responseData: WellEventLegendCreateResponse = { items: [] };

export const getMockWellLegendCreate = (id: string): MSWRequest => {
  const url = getNptLegendEndpoint(TEST_PROJECT, WellLegendNptType.Code, id);
  //   console.log('STARTING MOCK', url);

  return rest.post<Request>(url, (_req, res, ctx) => {
    return res(ctx.json(responseData));
  });
};
