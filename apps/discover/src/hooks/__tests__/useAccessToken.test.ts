import '__mocks/mockContainerAuth'; // should be first
import { renderHook } from '@testing-library/react-hooks';

import { QueryClientWrapper } from '__test-utils/queryClientWrapper';

import { useAccessToken } from '../useAccessToken';

describe('useAccessToken', () => {
  it('should be ok', async () => {
    const { result } = renderHook(() => useAccessToken(), {
      wrapper: QueryClientWrapper,
    });
    expect(result.current).toEqual('fake-token');
  });
});
