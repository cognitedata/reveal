import { rest } from 'msw';
import { TEST_PROJECT } from 'setupTests';

import { SavedSearchResponse } from '@cognite/discover-api-types';

import { MSWRequest } from '__test-utils/types';
import { SIDECAR } from 'constants/app';

import { getSavedSearchResponseFixture } from '../__fixtures/getSavedSearchResponseFixture';

// this type is wrong from the api, need to fix this routes schema in discover-api
const responseData: SavedSearchResponse = getSavedSearchResponseFixture();
const response = { success: true, data: { data: responseData } };

const url = `https://discover-api.staging.${SIDECAR.cdfCluster}.cognite.ai/${TEST_PROJECT}/savedSearches/current`;

export const getMockSavedSearchCurrentGet = (): MSWRequest => {
  return rest.get<Request>(url, (_req, res, ctx) => {
    return res(ctx.json(response));
  });
};
