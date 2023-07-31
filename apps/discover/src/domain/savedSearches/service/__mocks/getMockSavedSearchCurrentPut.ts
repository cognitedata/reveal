import { rest } from 'msw';
import { TEST_PROJECT } from 'setupTests';

import { SavedSearchResponse } from '@cognite/discover-api-types';

import { MSWRequest } from '__test-utils/types';
import { SIDECAR } from 'constants/app';

import { getSavedSearchResponseFixture } from '../__fixtures/getSavedSearchResponseFixture';

const responseData: SavedSearchResponse = getSavedSearchResponseFixture();

const response = { success: true, data: { data: responseData } };

export const getMockSavedSearchCurrentPut = (
  customResponse?: any
): MSWRequest => {
  const url = `https://discover-api.staging.${SIDECAR.cdfCluster}.cognite.ai/${TEST_PROJECT}/savedSearches/current`;

  return rest.put<Request>(url, (_req, res, ctx) => {
    return res(ctx.json(customResponse || response));
  });
};
