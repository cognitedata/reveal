import { rest } from 'msw';
import { TEST_PROJECT } from 'setupTests';

import { WellPropertiesSummaryItems } from '@cognite/sdk-wells';

import { MSWRequest } from '__test-utils/types';
import { SIDECAR } from 'constants/app';

import { getMockWellProperties } from '../__fixtures/getMockWellProperties';

const DEFAULT_RESPONSE_DATA: WellPropertiesSummaryItems = {
  items: getMockWellProperties(),
};

export const getMockWellPropertiesPost = (
  responseData: WellPropertiesSummaryItems = DEFAULT_RESPONSE_DATA
): MSWRequest => {
  const url = `https://${SIDECAR.cdfCluster}.cognitedata.com/api/playground/projects/${TEST_PROJECT}/wdl/summaries/wellproperties`;

  return rest.post<Request>(url, (_req, res, ctx) => {
    return res(ctx.json(responseData));
  });
};
