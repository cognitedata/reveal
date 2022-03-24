import { rest } from 'msw';
import { TEST_PROJECT } from 'setupTests';

import { AuthModes } from '@cognite/discover-api-types';

import { MSWRequest } from '__test-utils/types';
import { SIDECAR } from 'constants/app';

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
