import { rest } from 'msw';
import { TEST_PROJECT } from 'setupTests';

import { mockNdsEvents } from '__test-utils/fixtures/nds';
import { MSWRequest } from '__test-utils/types';
import { SIDECAR } from 'constants/app';

const responseData = {
  items: mockNdsEvents,
  nextCursor: undefined,
};

export const getMockNDSEventsPost = (): MSWRequest => {
  const url = `https://${SIDECAR.cdfCluster}.cognitedata.com/api/playground/projects/${TEST_PROJECT}/wdl/nds/list`;

  return rest.post<Request>(url, (_req, res, ctx) => {
    return res(ctx.json(responseData));
  });
};
