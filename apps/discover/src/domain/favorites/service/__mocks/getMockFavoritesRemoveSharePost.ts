import { rest } from 'msw';
import { TEST_PROJECT } from 'setupTests';

import { MSWRequest } from '__test-utils/types';
import { SIDECAR } from 'constants/app';

const responseData: unknown[] = [];

export const getMockFavoritesRemoveSharePost = (): MSWRequest => {
  return rest.post<Request>(
    `https://discover-api.staging.${SIDECAR.cdfCluster}.cognite.ai/${TEST_PROJECT}/favorites/removeshare`,
    (_req, res, ctx) => {
      return res(ctx.json(responseData));
    }
  );
};
