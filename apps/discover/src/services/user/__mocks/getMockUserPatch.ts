import { rest } from 'msw';
import { TEST_PROJECT } from 'setupTests';

import { getUser } from '__test-utils/fixtures/user';
import { defaultTestUser } from '__test-utils/testdata.utils';
import { MSWRequest } from '__test-utils/types';
import { SIDECAR } from 'constants/app';
import { User } from 'modules/user/types';

const responseData: User = {
  ...getUser({ id: defaultTestUser }),
  lastUpdatedTime: '1',
  createdTime: '1',
};

export const getMockUserPatch = (): MSWRequest => {
  const url = `https://discover-api.staging.${SIDECAR.cdfCluster}.cognite.ai/${TEST_PROJECT}/user`;

  // console.log('STARTING MOCK', url);

  return rest.patch<Request>(url, (_req, res, ctx) => {
    return res(ctx.json(responseData));
  });
};
