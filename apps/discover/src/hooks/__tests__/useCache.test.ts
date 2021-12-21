import { renderHook } from '@testing-library/react-hooks';

import { QueryClientWrapper } from '__test-utils/queryClientWrapper';

import { useCache } from '../useCache';

describe('useCache', () => {
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
      { wrapper: QueryClientWrapper }
    );

    await waitForNextUpdate();

    const { result, waitForNextUpdate: waitAgain } = renderHook(
      () =>
        useCache({
          key: 'c',
          items: new Set(['1', '2', '3', '4', '5']),
          fetchAction: async () => ({ '4': ['sub-4-a'], '5': ['sub-5-a'] }),
        }),
      { wrapper: QueryClientWrapper }
    );

    await waitAgain();
    expect(result.current.data).toEqual({
      '1': ['sub-1-a', 'sub-1-b'],
      '2': ['sub-2-a', 'sub-2-b'],
      '3': ['sub-3-a', 'sub-3-b'],
      '4': ['sub-4-a'],
      '5': ['sub-5-a'],
    });
  });
});
