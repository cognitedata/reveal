import { rest } from 'msw';
import { MSWRequest } from '@data-exploration-lib/core';
import { TEST_PROJECT } from '../../__mocks';
import { mock360Images } from '../__fixtures/mock360Images';

export const getMock360Images = (): MSWRequest => {
  return rest.post<Request>(
    `https://api.cognitedata.com/api/v1/projects/${TEST_PROJECT}/events/list`,
    (_req, res, ctx) => {
      return res(ctx.json(mock360Images));
    }
  );
};
