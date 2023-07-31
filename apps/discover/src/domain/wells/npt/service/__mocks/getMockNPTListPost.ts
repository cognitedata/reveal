import { rest } from 'msw';
import { TEST_PROJECT } from 'setupTests';

import { MSWRequest } from '__test-utils/types';
import { SIDECAR } from 'constants/app';

import { getMockNPTV3 } from '../__fixtures/getMockNPTV3';

const responseData = {
  items: [getMockNPTV3()],
  nextCursor: undefined,
};

export const getMockNPTListPost = (): MSWRequest => {
  const url = `https://${SIDECAR.cdfCluster}.cognitedata.com/api/playground/projects/${TEST_PROJECT}/wdl/npt/list`;

  return rest.post<Request>(url, (_req, res, ctx) => {
    return res(ctx.json(responseData));
  });
};
