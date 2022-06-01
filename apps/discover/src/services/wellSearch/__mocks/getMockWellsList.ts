import { getMockWell } from 'domain/wells/well/service/__fixtures/well';

import { rest } from 'msw';
import { TEST_PROJECT } from 'setupTests';

import { WellItems } from '@cognite/sdk-wells-v3';

import { MSWRequest } from '__test-utils/types';
import { SIDECAR } from 'constants/app';

const responseData: WellItems = {
  items: [getMockWell()],
  nextCursor: undefined,
};

export const getMockWellsList = (): MSWRequest => {
  const url = `https://${SIDECAR.cdfCluster}.cognitedata.com/api/playground/projects/${TEST_PROJECT}/wdl/wells/list`;

  // console.log('STARTING MOCK', url);

  return rest.post<Request>(url, (_req, res, ctx) => {
    return res(ctx.json(responseData));
  });
};
