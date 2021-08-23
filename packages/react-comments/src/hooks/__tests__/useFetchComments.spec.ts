import { renderHook } from '@testing-library/react-hooks';
import { rest } from 'msw';
import { setupServer } from 'msw/node';

import { useFetchComments } from '../useFetchComments';

const serviceUrl = 'https://localhost/test-project';
const handlers = [
  rest.post(`${serviceUrl}/comment/list`, (_req, res, ctx) => {
    return res(
      ctx.status(200),
      ctx.json({
        items: [
          {
            id: 1,
            comment: 'first comment',
            lastUpdatedTime: '2021-08-20T08:31:24.842Z',
          },
        ],
      })
    );
  }),
];

const server = setupServer(...handlers);

describe('useFetchComments', () => {
  beforeAll(() => server.listen());

  it('should be ok', async () => {
    const { result, waitForNextUpdate } = renderHook(
      () =>
        useFetchComments({
          target: { id: 'test', targetType: 'test' },
          serviceUrl,
        }),
      {
        // wrapper: QueryClientWrapper,
      }
    );

    expect(result.current).toEqual({ comments: [] });

    await waitForNextUpdate();

    expect(result.current).toEqual({
      comments: [
        {
          id: 1,
          text: 'first comment',
          timestamp: 1629448284842,
          user: 'Unknown',
        },
      ],
    });
  });
});
