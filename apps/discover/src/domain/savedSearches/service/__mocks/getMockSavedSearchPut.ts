import { rest } from 'msw';
import { TEST_PROJECT } from 'setupTests';

import { MSWRequest } from '__test-utils/types';
import { SIDECAR } from 'constants/app';

import { responseData, TEST_ID } from '../__fixtures/savedSearch';

export const getMockSavedSearchPut = (success = true): MSWRequest => {
  const response = { success, data: responseData.data };
  const baseUrl = `${SIDECAR.discoverApiBaseUrl}/${TEST_PROJECT}/savedSearches/${TEST_ID}`;

  return rest.put<Request>(baseUrl, (_req, res, ctx) => {
    return res(ctx.json(response));
  });
};
