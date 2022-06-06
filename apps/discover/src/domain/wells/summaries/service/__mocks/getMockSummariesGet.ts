import { rest } from 'msw';
import { TEST_PROJECT } from 'setupTests';

import { WellItems } from '@cognite/sdk-wells-v3';

import { MSWRequest } from '__test-utils/types';
import { SIDECAR } from 'constants/app';

const responseData: WellItems = {
  items: [],
  nextCursor: undefined,
};

export const getMockSummariesGet = (): MSWRequest => {
  const url = `https://${SIDECAR.cdfCluster}.cognitedata.com/api/playground/projects/${TEST_PROJECT}/wdl/summaries/*`;

  // console.log('STARTING MOCK', url);

  return rest.get<Request>(url, (_req, res, ctx) => {
    return res(ctx.json(responseData));
  });
};
