import { rest } from 'msw';
import { TEST_PROJECT } from 'setupTests';

import { MSWRequest } from '__test-utils/types';
import { SIDECAR } from 'constants/app';

const DEFAULT_ERROR_STATUS = 500;
const DEFAULT_ERROR_RESPONSE = {
  name: 'Error',
  message: 'Server error',
};

export const getMockCasingsListPostError = (
  status = DEFAULT_ERROR_STATUS,
  errorResponse: Error = DEFAULT_ERROR_RESPONSE
): MSWRequest => {
  const url = `https://${SIDECAR.cdfCluster}.cognitedata.com/api/playground/projects/${TEST_PROJECT}/wdl/casings/list`;

  return rest.post<Request>(url, (_req, res, ctx) => {
    return res(ctx.status(status), ctx.json(errorResponse));
  });
};
