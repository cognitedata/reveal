import { rest } from 'msw';
import { TEST_PROJECT } from 'setupTests';

import { SourceItems } from '@cognite/sdk-wells';

import { MSWRequest } from '__test-utils/types';
import { SIDECAR } from 'constants/app';

const responseData: SourceItems = {
  items: [],
};

export const getMockWellSourceGet = (): MSWRequest => {
  const url = `https://${SIDECAR.cdfCluster}.cognitedata.com/api/playground/projects/${TEST_PROJECT}/wdl/sources`;

  return rest.get<Request>(url, (_req, res, ctx) => {
    return res(ctx.json(responseData));
  });
};
