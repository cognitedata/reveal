import { rest } from 'msw';
import { TEST_PROJECT } from 'setupTests';

import { MSWRequest } from '__test-utils/types';
import { SIDECAR } from 'constants/app';

import { responseData } from '../__fixtures/savedSearch';

export const getMockSavedSearchRemoveSharePost = (
  success = true
): MSWRequest => {
  const response = { success, data: responseData.data };
  const baseUrl = `${SIDECAR.discoverApiBaseUrl}/${TEST_PROJECT}/savedSearches/removeshare`;

  return rest.post<Request>(baseUrl, (_req, res, ctx) => {
    return res(ctx.json(response));
  });
};
