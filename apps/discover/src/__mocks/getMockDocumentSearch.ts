import { rest } from 'msw';
import { TEST_PROJECT } from 'setupTests';

import { MSWRequest } from '__test-utils/types';

import {
  getMockAPIResponse,
  getMockApiResultItem,
} from '../__test-utils/fixtures/document';
import { SIDECAR } from '../constants/app';

const responseData = getMockAPIResponse([getMockApiResultItem()]);

export const getMockDocumentSearch = (): MSWRequest => {
  const url = `https://${SIDECAR.cdfCluster}.cognitedata.com/api/playground/projects/${TEST_PROJECT}/documents/search`;

  // console.log('STARTING MOCK', url);

  return rest.post<Request>(url, (_req, res, ctx) => {
    return res(ctx.json(responseData));
  });
};
