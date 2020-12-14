import { renderHook, act } from '@testing-library/react-hooks';
import { sdkv3 } from '@cognite/cdf-sdk-singleton';
import { useRuns } from './useRuns';
import { mockError, mockDataRunsResponse } from '../utils/mockResponse';

describe('useRuns', () => {
  const externalId = 'dataIntegration000-1';

  test('Returns runs on success', async () => {
    sdkv3.get.mockResolvedValue({ data: mockDataRunsResponse });

    await act(async () => {
      const { result, waitFor } = renderHook(() => useRuns(externalId));
      await waitFor(() => {
        expect(result.current.data).toEqual(mockDataRunsResponse.items);
      });
    });
  });

  test('Returns error on fail', async () => {
    jest.setTimeout(10000);
    const rejectValue = mockError;
    sdkv3.get.mockRejectedValue(rejectValue);

    await act(async () => {
      const { result, waitFor } = renderHook(() => useRuns(externalId));
      await waitFor(() => {
        expect(result.current.error).toEqual(rejectValue);
      });
    });
  });
});
