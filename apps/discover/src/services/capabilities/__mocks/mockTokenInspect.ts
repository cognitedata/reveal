import { rest } from 'msw';

import { MSWRequest } from '__test-utils/types';
import { SIDECAR } from 'constants/app';

const url = `${SIDECAR.cdfApiBaseUrl}/api/v1/token/inspect`;

export const getMockTokenInspect = (customResponse?: any): MSWRequest => {
  return rest.get<Request>(url, (_req, res, ctx) => {
    return res(ctx.json(customResponse));
  });
};
