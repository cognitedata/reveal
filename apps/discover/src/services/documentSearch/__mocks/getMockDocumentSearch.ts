import { rest } from 'msw';
import { TEST_PROJECT } from 'setupTests';

import { DocumentSearchResponse } from '@cognite/sdk';

import { getMockAPIResponse } from '__test-utils/fixtures/document';
import { getDocumentFixture } from '__test-utils/fixtures/documents/getDocumentFixture';
import { MSWRequest } from '__test-utils/types';
import { SIDECAR } from 'constants/app';

export const getMockDocumentSearch = (
  customResponse?: DocumentSearchResponse
): MSWRequest => {
  const url = `${SIDECAR.cdfApiBaseUrl}/api/v1/projects/${TEST_PROJECT}/documents/search`;

  // console.log('STARTING MOCK', url);

  return rest.post<Request>(url, (_req, res, ctx) => {
    return res(
      ctx.json(
        customResponse || getMockAPIResponse([{ item: getDocumentFixture() }])
      )
    );
  });
};
