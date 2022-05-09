import { rest } from 'msw';

import { MSWRequest } from '__test-utils/types';
import { SIDECAR } from 'constants/app';

import { getMockUmsUsers } from '../__fixtures/umsUsers';

export const getMockUserSearch = (): MSWRequest => {
  return rest.post<Request>(
    `https://user-management-service.staging.${SIDECAR.cdfCluster}.cognite.ai/user/search`,
    (_req, res, ctx) => {
      return res(ctx.json(getMockUmsUsers()));
    }
  );
};
