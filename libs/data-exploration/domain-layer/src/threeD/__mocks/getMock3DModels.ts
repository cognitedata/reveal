import { rest } from 'msw';
import { MSWRequest } from '@data-exploration-lib/core';
import { mock3dModels } from '../__fixtures/mock3dModels';
import { TEST_PROJECT } from '@data-exploration-lib/domain-layer';

export const getMock3DModels = (): MSWRequest => {
  return rest.get<Request>(
    `https://api.cognitedata.com/api/v1/projects/${TEST_PROJECT}/3d/models`,
    (_req, res, ctx) => {
      return res(ctx.json(mock3dModels));
    }
  );
};
