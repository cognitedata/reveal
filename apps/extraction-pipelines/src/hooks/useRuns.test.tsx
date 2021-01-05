import { renderHook } from '@testing-library/react-hooks';
import { sdkv3 } from '@cognite/cdf-sdk-singleton';
import { QueryClient } from 'react-query';
import { useRuns } from './useRuns';
import { mockError, mockDataRunsResponse } from '../utils/mockResponse';
import { renderWithQueryClient } from '../utils/test/render';

describe('useRuns', () => {
  const externalId = 'dataIntegration000-1';
  let client: QueryClient;
  let wrapper;
  beforeEach(() => {
    client = new QueryClient();
    wrapper = renderWithQueryClient(client);
  });

  test('Returns runs on success', async () => {
    sdkv3.get.mockResolvedValue({ data: mockDataRunsResponse });
    const { result, waitFor } = renderHook(() => useRuns(externalId), {
      wrapper,
    });
    await waitFor(() => {
      expect(result.current.data).toEqual(mockDataRunsResponse.items);
    });
  });

  test('Returns error on fail', async () => {
    jest.setTimeout(10000);
    const rejectValue = mockError;
    sdkv3.get.mockRejectedValue(rejectValue);
    const { result, waitFor } = renderHook(() => useRuns(externalId), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.error).toEqual(rejectValue);
    });
  });
});
