import { renderHook } from '@testing-library/react-hooks';
import { QueryClientWrapper } from '__test_utils__/queryClientWrapper';

import {
  mockListComments,
  serviceUrl,
  testProject,
} from '../../__test_utils__/listComments';
import { useFetchComments } from '../useFetchComments';

describe('useFetchComments', () => {
  beforeAll(() => mockListComments.listen());
  afterAll(() => mockListComments.close());

  it('should be ok', async () => {
    const { result, waitForNextUpdate } = renderHook(
      () =>
        useFetchComments({
          target: { id: 'test', targetType: 'test' },
          serviceUrl: `${serviceUrl}/${testProject}`,
        }),
      {
        wrapper: QueryClientWrapper,
      }
    );

    expect(result.current.data).toEqual(undefined);

    await waitForNextUpdate();

    expect(result.current.data).toEqual([
      {
        id: 1,
        text: 'first comment',
        timestamp: 1629448284842,
        user: 'Unknown',
      },
      {
        id: 2,
        text: 'second comment',
        timestamp: 1629448344842,
        user: 'Unknown',
      },
    ]);
  });
});
