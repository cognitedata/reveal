import { rest } from 'msw';
import { getMockSearchHistory } from 'services/searchHistory/__fixtures/searchHistory';
import { TEST_PROJECT } from 'setupTests';

import { SearchHistoryResponse } from '@cognite/discover-api-types';

import { MSWRequest } from '__test-utils/types';
import { SIDECAR } from 'constants/app';

const responseData: SearchHistoryResponse[] = getMockSearchHistory();

export const getMockSearchHistoryGet = (): MSWRequest => {
  const url = `https://discover-api.staging.${SIDECAR.cdfCluster}.cognite.ai/${TEST_PROJECT}/searchHistory`;

  // console.log('STARTING MOCK', url);

  return rest.get<Request>(url, (_req, res, ctx) => {
    return res(ctx.json(responseData));
  });
};
