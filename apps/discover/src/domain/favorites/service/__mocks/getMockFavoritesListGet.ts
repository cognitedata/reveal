import { rest } from 'msw';
import { TEST_PROJECT } from 'setupTests';

import { MSWRequest } from '__test-utils/types';
import { SIDECAR } from 'constants/app';

const responseData: unknown[] = [];
const url = `https://discover-api.staging.${SIDECAR.cdfCluster}.cognite.ai/${TEST_PROJECT}/favorites`;

export const getMockFavoritesListGet = (): MSWRequest => {
  return rest.get<Request>(`${url}`, (_req, res, ctx) => {
    return res(ctx.json(responseData));
  });
};
