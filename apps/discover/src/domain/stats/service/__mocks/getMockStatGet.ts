import { rest } from 'msw';
import { TEST_PROJECT } from 'setupTests';

import { MSWRequest } from '__test-utils/types';
import { SIDECAR } from 'constants/app';

import { StatsApiResult } from '../types';

const statUrl = `${SIDECAR.discoverApiBaseUrl}/${TEST_PROJECT}/stats`;

export const getMockStatGet = (customResponse?: StatsApiResult): MSWRequest => {
  return rest.get<Request>(statUrl, (_req, res, ctx) => {
    return res(ctx.json(customResponse));
  });
};
