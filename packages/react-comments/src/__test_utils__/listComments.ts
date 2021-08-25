import { rest } from 'msw';
import { setupServer } from 'msw/node';

export const serviceUrl = 'https://localhost';
export const testProject = 'test-project';

const handlers = [
  rest.post(`${serviceUrl}/${testProject}/comment/list`, (_req, res, ctx) => {
    // console.log('Returning data from mock!');
    return res(
      ctx.status(200),
      ctx.json({
        items: [
          {
            id: 1,
            comment: 'first comment',
            lastUpdatedTime: '2021-08-20T08:31:24.842Z',
          },
          {
            id: 2,
            comment: 'second comment',
            lastUpdatedTime: '2021-08-20T08:32:24.842Z',
          },
        ],
      })
    );
  }),
];

const server = setupServer(...handlers);

export const mockListComments = server;
