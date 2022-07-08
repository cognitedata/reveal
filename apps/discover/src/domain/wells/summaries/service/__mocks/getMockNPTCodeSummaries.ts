import { rest } from 'msw';
import { TEST_PROJECT } from 'setupTests';

import { SummaryCount } from '@cognite/sdk-wells';

import { MSWRequest } from '__test-utils/types';
import { SIDECAR } from 'constants/app';

import { getNptCodeSummaries } from '../__fixtures/nptCodeSummaries';

export const getMockNPTCodeSummaries = (
  customResponse?: SummaryCount[]
): MSWRequest => {
  const url = `${SIDECAR.cdfApiBaseUrl}/api/playground/projects/${TEST_PROJECT}/wdl/summaries/npt/codes`;

  return rest.get<Request>(url, (_req, res, ctx) => {
    return res(ctx.json({ items: customResponse || getNptCodeSummaries() }));
  });
};
