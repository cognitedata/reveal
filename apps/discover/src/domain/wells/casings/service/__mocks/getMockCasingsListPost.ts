import { rest } from 'msw';
import { TEST_PROJECT } from 'setupTests';

import { CasingItems } from '@cognite/sdk-wells';

import { MSWRequest } from '__test-utils/types';
import { SIDECAR } from 'constants/app';

import { getMockCasingSchematic } from '../__fixtures/getMockCasingSchematic';

const DEFAULT_RESPONSE_DATA: CasingItems = {
  items: [getMockCasingSchematic()],
  nextCursor: undefined,
};

export const getMockCasingsListPost = (
  responseData: CasingItems = DEFAULT_RESPONSE_DATA
): MSWRequest => {
  const url = `https://${SIDECAR.cdfCluster}.cognitedata.com/api/playground/projects/${TEST_PROJECT}/wdl/casings/list`;

  return rest.post<Request>(url, (_req, res, ctx) => {
    return res(ctx.json(responseData));
  });
};
