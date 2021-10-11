import { renderHook } from '@testing-library/react-hooks';

import { QueryClientWrapper } from '__test-utils/queryClientWrapper';

import { useAccessToken } from '../useAccessToken';

describe('useAccessToken', () => {
  it('should be ok', async () => {
    const { result, waitForNextUpdate } = renderHook(() => useAccessToken(), {
      wrapper: QueryClientWrapper,
    });
    await waitForNextUpdate();
    expect(result.current).toEqual('fake-token');
  });
});
