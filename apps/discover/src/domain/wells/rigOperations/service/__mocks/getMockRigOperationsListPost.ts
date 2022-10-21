import { rest } from 'msw';
import { TEST_PROJECT } from 'setupTests';

import { RigOperationItems } from '@cognite/sdk-wells';

import { MSWRequest } from '__test-utils/types';
import { SIDECAR } from 'constants/app';

import { getMockRigOperation } from '../__fixtures/getMockRigOperation';

const DEFAULT_RESPONSE_DATA: RigOperationItems = {
  items: [getMockRigOperation()],
  nextCursor: undefined,
};

export const getMockRigOperationsListPost = (
  responseData: RigOperationItems = DEFAULT_RESPONSE_DATA
): MSWRequest => {
  const url = `https://${SIDECAR.cdfCluster}.cognitedata.com/api/playground/projects/${TEST_PROJECT}/wdl/rigoperations/list`;

  return rest.post<Request>(url, (_req, res, ctx) => {
    return res(ctx.json(responseData));
  });
};
