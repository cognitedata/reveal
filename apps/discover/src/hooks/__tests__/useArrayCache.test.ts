import { renderHook } from '@testing-library/react-hooks';

import { QueryClientWrapper } from '__test-utils/queryClientWrapper';

import { useArrayCache } from '../useArrayCache';

describe('useArrayCache', () => {
  const dynamicFetchAction = (items: Set<string>) => {
    return Promise.resolve(
      Array.from(items.keys()).reduce((result, item) => {
        return {
          [item]: [`sub-${item}-a`, `sub-${item}-b`],
          ...result,
        };
      }, {})
    );
  };

  it('should be ok in good case', async () => {
    const { result, waitForNextUpdate } = renderHook(
      () =>
        useArrayCache({
          key: 'a',
          items: new Set(['1', '2', '3']),
          fetchAction: dynamicFetchAction,
        }),
      { wrapper: QueryClientWrapper }
    );

    await waitForNextUpdate();
    expect(result.current.data).toEqual([
      'sub-1-a',
      'sub-1-b',
      'sub-2-a',
      'sub-2-b',
      'sub-3-a',
      'sub-3-b',
    ]);
  });

  it('should build upon previous cache', async () => {
    const { waitForNextUpdate } = renderHook(
      () =>
        useArrayCache({
          key: 'c',
          items: new Set(['1', '2', '3']),
          fetchAction: dynamicFetchAction,
        }),
      { wrapper: QueryClientWrapper }
    );

    await waitForNextUpdate();

    const { result, waitForNextUpdate: waitAgain } = renderHook(
      () =>
        useArrayCache({
          key: 'c',
          items: new Set(['1', '2', '3', '4', '5']),
          fetchAction: async () => ({ '4': ['sub-4-a'], '5': ['sub-5-a'] }),
        }),
      { wrapper: QueryClientWrapper }
    );

    await waitAgain();
    expect(result.current.data).toEqual([
      'sub-1-a',
      'sub-1-b',
      'sub-2-a',
      'sub-2-b',
      'sub-3-a',
      'sub-3-b',
      'sub-4-a',
      'sub-5-a',
    ]);
  });
});
