import { rest } from 'msw';
import { TEST_PROJECT } from 'setupTests';

import { MSWRequest } from '__test-utils/types';
import { SIDECAR } from 'constants/app';
import { AuthModes } from 'modules/user/types';

const responseData: AuthModes = {
  isAdmin: true,
  isUser: true,
};

export const getMockUserRolesLegacyGet = (): MSWRequest => {
  const url = `https://discover-api.staging.${SIDECAR.cdfCluster}.cognite.ai/${TEST_PROJECT}/user/roles/legacy`;

  // console.log('STARTING MOCK', url);

  return rest.get<Request>(url, (_req, res, ctx) => {
    return res(ctx.json(responseData));
  });
};
