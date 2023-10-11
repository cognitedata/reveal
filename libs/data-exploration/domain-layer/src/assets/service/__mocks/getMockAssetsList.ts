import { rest } from 'msw';

import { MSWRequest } from '@data-exploration-lib/core';

import { getAssetsFixture } from '../__fixtures/getAssetsFixture';

const responseData = getAssetsFixture();

export const getMockAssetsList = (): MSWRequest => {
  return rest.post<Request>(
    `https://api.cognitedata.com/api/v1/projects/testProject/assets/list`,
    (_req, res, ctx) => {
      return res(ctx.json({ items: responseData }));
    }
  );
};
