import { rest } from 'msw';
import { TEST_PROJECT } from 'setupTests';

import { MSWRequest } from '__test-utils/types';
import { SIDECAR } from 'constants/app';

const badResponseData: unknown = { error: 'test error' };
const goodResponseData: unknown = { data: { results: [] } };

export const getMockSeismicSearch = (fail = false): MSWRequest => {
  const url = `https://discover-api.staging.${SIDECAR.cdfCluster}.cognite.ai/${TEST_PROJECT}/v2/seismic/search/current`;

  //   console.log('STARTING MOCK', url);

  return rest.get<Request>(url, (_req, res, ctx) => {
    return res(ctx.json(fail ? badResponseData : goodResponseData));
  });
};
