import { rest } from 'msw';

import { FileInfo } from '@cognite/sdk';

import { getFileFixture } from '../../../__test-utils/fixtures/documents/getFileFixture';
import { SIDECAR } from '../../../constants/app';
import { TEST_PROJECT } from '../../../setupTests';

export const getMockFilesByIds = (customResponse?: FileInfo[]) => {
  const url = `${SIDECAR.cdfApiBaseUrl}/api/v1/projects/${TEST_PROJECT}/files/byids`;

  const mockResponse = {
    items: [getFileFixture()],
  };

  return rest.post<Request>(url, (_req, res, ctx) => {
    return res(ctx.json({ items: customResponse } || mockResponse));
  });
};
