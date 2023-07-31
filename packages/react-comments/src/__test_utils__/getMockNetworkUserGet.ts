import { rest } from 'msw';

import { getMockUser } from './getMockUser';

export const serviceUrl = 'https://localhost';

export const getMockNetworkUserGet = (id: string) => {
  const url = `${serviceUrl}/user/${id}`;
  return rest.get(url, (_req, res, ctx) => {
    // console.log('Returning data from mock!');
    return res(ctx.status(200), ctx.json(getMockUser()));
  });
};
