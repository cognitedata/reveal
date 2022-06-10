import { rest } from 'msw';
import { TEST_PROJECT } from 'setupTests';

import { MSWRequest } from '__test-utils/types';
import { SIDECAR } from 'constants/app';

const goodResponseData: unknown = { success: true, data: true };
const badResponseData: unknown = { error: true, data: false };

export const getMockSeismicGet = (fail = false): MSWRequest => {
  const url = `https://discover-api.staging.${SIDECAR.cdfCluster}.cognite.ai/${TEST_PROJECT}/seismic/survey/1`;

  //   console.log('STARTING MOCK', url);

  return rest.get<Request>(url, (_req, res, ctx) => {
    return res(ctx.json(fail ? badResponseData : goodResponseData));
  });
};
