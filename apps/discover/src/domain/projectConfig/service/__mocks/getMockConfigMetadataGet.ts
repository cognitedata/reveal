import { rest } from 'msw';
import { TEST_PROJECT } from 'setupTests';

import { ProjectConfig } from '@cognite/discover-api-types';

import { getMockConfig } from '__test-utils/fixtures/projectConfig';
import { MSWRequest } from '__test-utils/types';
import { SIDECAR } from 'constants/app';

export const getMockConfigMetadataGet = (
  customProjectConfig?: ProjectConfig
): MSWRequest => {
  const url = `https://discover-api.staging.${SIDECAR.cdfCluster}.cognite.ai/${TEST_PROJECT}/config/metadata`;
  const responseData: ProjectConfig = getMockConfig();

  return rest.get<Request>(url, (_req, res, ctx) => {
    return res(ctx.json(customProjectConfig || responseData));
  });
};
