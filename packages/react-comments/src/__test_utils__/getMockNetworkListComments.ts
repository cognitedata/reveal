import { rest } from 'msw';

import { getComment } from './getComment';

export const serviceUrl = 'https://localhost';
export const testProject = 'test-project';

export const getMockNetworkListComments = () =>
  rest.post(`${serviceUrl}/${testProject}/comment/list`, (_req, res, ctx) => {
    // console.log('Returning data from mock!');
    return res(
      ctx.status(200),
      ctx.json({
        items: [
          getComment({
            id: '1',
            comment: 'first comment',
          }),
          getComment({
            id: '2',
            displayName: 'test-displayName',
            comment: 'second comment',
          }),
        ],
      })
    );
  });
