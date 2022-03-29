import { rest } from 'msw';
import { TEST_PROJECT } from 'setupTests';

import { ProjectConfig } from '@cognite/discover-api-types';

import { getMockConfig } from '__test-utils/fixtures/projectConfig';
import { MSWRequest } from '__test-utils/types';
import { SIDECAR } from 'constants/app';

export const getMockConfigPatch = (
  status: number,
  customProjectConfig?: ProjectConfig
): MSWRequest => {
  const url = `https://discover-api.staging.${SIDECAR.cdfCluster}.cognite.ai/${TEST_PROJECT}/config`;
  const responseData: ProjectConfig = getMockConfig();

  return rest.patch<Request>(url, (_req, res, ctx) => {
    return res(
      ctx.status(status),
      ctx.json(customProjectConfig || responseData)
    );
  });
};
