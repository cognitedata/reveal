import { renderHook, act } from '@testing-library/react-hooks';
import { sdkv3 } from '@cognite/cdf-sdk-singleton';
import { waitFor } from '@testing-library/react';
import { useRuns } from './useRuns';
import { mockError, mockDataRunsResponse } from '../utils/mockResponse';

describe('useRuns', () => {
  const externalId = 'dataIntegration000-1';

  test('Returns runs on success', async () => {
    sdkv3.get.mockResolvedValue({ data: mockDataRunsResponse });

    await act(async () => {
      const { result } = renderHook(() => useRuns(externalId));
      await waitFor(() => {
        expect(result.current.data).toEqual(mockDataRunsResponse.items);
      });
    });
  });

  test('Returns error on fail', async () => {
    const rejectValue = mockError;
    sdkv3.get.mockRejectedValue(rejectValue);

    await act(async () => {
      const { result } = renderHook(() => useRuns(externalId));
      await waitFor(() => {
        expect(result.current.error).toEqual(rejectValue);
      });
    });
  });
});
