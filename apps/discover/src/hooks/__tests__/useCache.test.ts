import { QueryClient } from 'react-query';

import { renderHook } from '@testing-library/react-hooks';

import { QueryClientWrapper } from '__test-utils/queryClientWrapper';

import { useCache } from '../useCache';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

describe('useCache', () => {
  const dynamicFetchAction = jest.fn((items: Set<string>) => {
    return Promise.resolve(
      Array.from(items.keys()).reduce((result, item) => {
        return {
          [item]: [`sub-${item}-a`, `sub-${item}-b`],
          ...result,
        };
      }, {})
    );
  });

  it('should be ok in good case', async () => {
    const { result, waitForNextUpdate } = renderHook(
      () =>
        useCache({
          key: 'a',
          items: new Set(['1', '2', '3']),
          fetchAction: dynamicFetchAction,
        }),
      { wrapper: QueryClientWrapper }
    );

    await waitForNextUpdate();
    expect(result.current.data).toEqual({
      '1': ['sub-1-a', 'sub-1-b'],
      '2': ['sub-2-a', 'sub-2-b'],
      '3': ['sub-3-a', 'sub-3-b'],
    });
  });

  it('should build upon previous cache', async () => {
    const { waitForNextUpdate } = renderHook(
      () =>
        useCache({
          key: 'c',
          items: new Set(['1', '2', '3']),
          fetchAction: dynamicFetchAction,
        }),
      { wrapper: QueryClientWrapper, initialProps: { queryClient } }
    );

    await waitForNextUpdate();

    expect(dynamicFetchAction).toHaveBeenCalledWith(
      new Set(['1', '2', '3']),
      expect.anything()
    );

    const { result, waitForNextUpdate: waitAgain } = renderHook(
      () =>
        useCache({
          key: 'c',
          items: new Set(['1', '2', '3', '4', '5']),
          fetchAction: dynamicFetchAction,
        }),
      { wrapper: QueryClientWrapper, initialProps: { queryClient } }
    );

    await waitAgain();

    expect(dynamicFetchAction).toHaveBeenCalledWith(
      new Set(['4', '5']),
      expect.anything()
    );

    expect(result.current.data).toEqual({
      '1': ['sub-1-a', 'sub-1-b'],
      '2': ['sub-2-a', 'sub-2-b'],
      '3': ['sub-3-a', 'sub-3-b'],
      '4': ['sub-4-a', 'sub-4-b'],
      '5': ['sub-5-a', 'sub-5-b'],
    });
  });
});
