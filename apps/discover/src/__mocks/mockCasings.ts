import { rest } from 'msw';
import { TEST_PROJECT } from 'setupTests';

import { CasingItems } from '@cognite/sdk-wells-v3';

import { getMockCasings } from '__test-utils/fixtures/well/casing';
import { MSWRequest } from '__test-utils/types';

import { SIDECAR } from '../constants/app';

const responseData: CasingItems = {
  items: getMockCasings(),
  nextCursor: undefined,
};

export const getMockCasingsList = (): MSWRequest => {
  const url = `https://${SIDECAR.cdfCluster}.cognitedata.com/api/playground/projects/${TEST_PROJECT}/wdl/casings/list`;

  return rest.post<Request>(url, (_req, res, ctx) => {
    return res(ctx.json(responseData));
  });
};
