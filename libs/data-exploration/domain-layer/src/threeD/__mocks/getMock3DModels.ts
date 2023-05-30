import { rest } from 'msw';

import { MSWRequest } from '@data-exploration-lib/core';

import { TEST_PROJECT } from '../../__mocks';
import { mock3dModels } from '../__fixtures/mock3dModels';

export const getMock3DModels = (): MSWRequest => {
  return rest.get<Request>(
    `https://api.cognitedata.com/api/v1/projects/${TEST_PROJECT}/3d/models`,
    (_req, res, ctx) => {
      return res(ctx.json(mock3dModels));
    }
  );
};
