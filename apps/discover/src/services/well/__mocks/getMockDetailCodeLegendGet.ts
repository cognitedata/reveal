import { rest } from 'msw';
import { getNptLegendEndpoint } from 'services/well/legend/npt/service';
import { TEST_PROJECT } from 'setupTests';

import { WellEventLegend } from '@cognite/discover-api-types/types/model/wellEventLegend';

import { MSWRequest } from '__test-utils/types';

import { WellLegendNptType } from '../legend/types';

export const getMockDetailCodeLegendGet = (
  customResponse?: WellEventLegend[]
): MSWRequest => {
  const url = getNptLegendEndpoint(TEST_PROJECT, WellLegendNptType.DetailCode);

  // console.log('STARTING MOCK', url);

  return rest.get<Request>(url, (_req, res, ctx) => {
    return res(ctx.json({ items: customResponse || [] }));
  });
};
