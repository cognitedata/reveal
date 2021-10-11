import { renderHook } from '@testing-library/react-hooks';

import { getJsonHeaders, discoverAPI } from '../service';

jest.mock('react-query', () => ({
  useQuery: () => ({ isLoading: false, error: {}, data: [] }),
}));

describe('getJsonHeaders', () => {
  it('should be ok in good case', () => {
    const { result, waitForNextUpdate } = renderHook(() => getJsonHeaders());
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
