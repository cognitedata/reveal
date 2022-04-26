import { rest } from 'msw';
import { TEST_PROJECT } from 'setupTests';

import { getMockLabelsList } from '__test-utils/fixtures/labelsList';
import { MSWRequest } from '__test-utils/types';
import { SIDECAR } from 'constants/app';

export const getMockLabels = (): MSWRequest => {
  const url = `https://${SIDECAR.cdfCluster}.cognitedata.com/api/v1/projects/${TEST_PROJECT}/labels/list`;
  return rest.post<Request>(url, (_req, res, ctx) => {
    return res(ctx.json(getMockLabelsList()));
  });
};
