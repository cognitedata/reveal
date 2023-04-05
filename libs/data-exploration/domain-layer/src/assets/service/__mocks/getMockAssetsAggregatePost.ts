import { rest } from 'msw';
import { MSWRequest } from '@data-exploration-lib/core';

import { getAssetsMetadataValues } from '../__fixtures/getAssetsMetadataValuesFixture';

const responseData = getAssetsMetadataValues();

export const getMockAssetsAggregatePost = (): MSWRequest => {
  return rest.post<Request>(
    `https://api.cognitedata.com/api/v1/projects/testProject/assets/aggregate`,
    (_req, res, ctx) => {
      return res(ctx.json({ items: responseData }));
    }
  );
};
