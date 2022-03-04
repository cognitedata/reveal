import { rest } from 'msw';
import { TEST_PROJECT } from 'setupTests';

import { SavedSearchResponse } from '@cognite/discover-api-types';

import { MSWRequest } from '__test-utils/types';
import { SIDECAR } from 'constants/app';

import { getSavedSearchResponseFixture } from '../__fixtures/getSavedSearchResponseFixture';
import { SAVED_SEARCHES_CURRENT_KEY } from '../constants';

// this type is wrong from the api, need to fix this routes schema in discover-api
const responseData: SavedSearchResponse = getSavedSearchResponseFixture({
  id: '1',
  name: 'test-list-1',
});
const response = {
  success: true,
  data: {
    list: [responseData, { ...responseData, id: SAVED_SEARCHES_CURRENT_KEY }],
  },
};

export const getMockSavedSearchList = (): MSWRequest => {
  const url = `https://discover-api.staging.${SIDECAR.cdfCluster}.cognite.ai/${TEST_PROJECT}/savedSearches`;

  // console.log('STARTING MOCK', url);

  return rest.get<Request>(url, (_req, res, ctx) => {
    return res(ctx.json(response));
  });
};
