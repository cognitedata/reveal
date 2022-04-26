import { rest } from 'msw';

export const MOCK_DOWNLOAD_URL = 'https://mock-document-download-url.com';

export const getMockFilesDownloadLinkEndpoint = () => {
  return rest.get<Request>(MOCK_DOWNLOAD_URL, (_req, res, ctx) => {
    const file = new File(['1'], 'someName');
    return res(
      ctx.set('Content-Length', '1'),
      ctx.set('Content-Type', 'image/jpeg'),
      ctx.body(file)
    );
  });
};
