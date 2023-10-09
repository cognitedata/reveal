import { rest } from 'msw';

import { Asset } from '@cognite/sdk';

import { MSWRequest } from '@data-exploration-lib/core';

import { getAssetsFixture } from '../__fixtures/getAssetsFixture';

const responseData = getAssetsFixture();

export const getMockAssetsByIdsPost = (data?: Asset[]): MSWRequest => {
  return rest.post<Request>(
    `https://api.cognitedata.com/api/v1/projects/testProject/assets/byids`,
    (_req, res, ctx) => {
      return res(ctx.json({ items: data || responseData }));
    }
  );
};
