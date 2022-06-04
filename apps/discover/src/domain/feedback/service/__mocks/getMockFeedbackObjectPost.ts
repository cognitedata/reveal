import { rest } from 'msw';
import { TEST_PROJECT } from 'setupTests';

import { FeedbackPostResponse } from '@cognite/discover-api-types';

import { MSWRequest } from '__test-utils/types';
import { SIDECAR } from 'constants/app';

const responseData: FeedbackPostResponse = {};
const url = `https://discover-api.staging.${SIDECAR.cdfCluster}.cognite.ai/${TEST_PROJECT}/feedback/object`;

export const getMockFeedbackObjectPost = (): MSWRequest => {
  return rest.post<Request>(`${url}`, (_req, res, ctx) => {
    return res(ctx.json(responseData));
  });
};
