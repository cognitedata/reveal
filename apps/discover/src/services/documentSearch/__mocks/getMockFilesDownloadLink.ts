import uniqueId from 'lodash/uniqueId';
import { rest } from 'msw';
import { TEST_PROJECT } from 'setupTests';

import { FileLink, IdEither } from '@cognite/sdk';

import { MSWRequest } from '__test-utils/types';
import { SIDECAR } from 'constants/app';
import { MOCK_DOWNLOAD_URL } from 'modules/documentSearch/__mocks/getMockFilesDownloadLinkEndpoint';

export const getMockFilesDownloadLink = (customResponse?: {
  items: (FileLink & IdEither)[];
}): MSWRequest => {
  const url = `${SIDECAR.cdfApiBaseUrl}/api/v1/projects/${TEST_PROJECT}/files/downloadlink`;
  const mockUrl = {
    items: [
      {
        downloadUrl: MOCK_DOWNLOAD_URL,
        id: uniqueId(),
      },
    ],
  };

  return rest.post<Request>(url, (_req, res, ctx) => {
    return res(ctx.json(customResponse || mockUrl));
  });
};
