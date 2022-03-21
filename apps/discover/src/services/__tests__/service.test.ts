import '__mocks/mockContainerAuth'; // should be first
import { renderHook } from '@testing-library/react-hooks';

import { useJsonHeaders, discoverAPI } from '../service';

jest.mock('react-query', () => ({
  ...jest.requireActual('react-query'),
  useQuery: () => ({ isLoading: false, error: {}, data: [] }),
}));

describe('useJsonHeaders', () => {
  it('should be ok in good case', () => {
    const { result, waitForNextUpdate } = renderHook(() => useJsonHeaders());
    waitForNextUpdate();
    expect(result.current).toEqual({
      auth: true,
      Authorization: 'Bearer fake-token',
      'Content-Type': 'application/json',
    });
  });
});

describe('discoverAPI', () => {
  it('should export the discoverAPI object', () => {
    expect(discoverAPI).toBeTruthy();
  });
});
