import { rest } from 'msw';
import { TEST_PROJECT } from 'setupTests';

import { ProjectConfig } from '@cognite/discover-api-types';

import { getMockConfig } from '__test-utils/fixtures/projectConfig';
import { MSWRequest } from '__test-utils/types';
import { SIDECAR } from 'constants/app';

const responseData: ProjectConfig = getMockConfig();

export const getMockConfigGet = (): MSWRequest => {
  const url = `https://discover-api.staging.${SIDECAR.cdfCluster}.cognite.ai/${TEST_PROJECT}/config`;

  // console.log('STARTING MOCK', url);

  return rest.get<Request>(url, (_req, res, ctx) => {
    return res(ctx.json(responseData));
  });
};
