import { QueryCache } from 'react-query';
import { renderHook, act } from '@testing-library/react-hooks';
import { sdkv3 } from '@cognite/cdf-sdk-singleton';
import { waitFor } from '@testing-library/react';
import { useIntegrations } from './useIntegrations';
import { renderWithReactQueryCacheProvider } from '../utils/test/render';
import { mockError, getMockResponse } from '../utils/mockResponse';

describe('useIntgrations', () => {
  const project = 'itera-int-green';
  const origin = 'dev';
  const cdfEnv = 'greenfield';

  test('Returns integrations on success', async () => {
    sdkv3.get.mockResolvedValue({ data: { items: getMockResponse() } });
    const queryCache = new QueryCache();

    await act(async () => {
      const wrapper = renderWithReactQueryCacheProvider(
        queryCache,
        origin,
        project,
        cdfEnv
      );
      const { result } = renderHook(() => useIntegrations(), { wrapper });
      await waitFor(() => {
        expect(result.current.data).toEqual(getMockResponse());
      });
    });
  });

  test('Returns error on fail', async () => {
    const rejectValue = mockError;
    sdkv3.get.mockRejectedValue(rejectValue);
    const queryCache = new QueryCache();

    await act(async () => {
      const wrapper = renderWithReactQueryCacheProvider(
        queryCache,
        project,
        origin,
        cdfEnv
      );
      const { result } = renderHook(() => useIntegrations(), { wrapper });
      await waitFor(() => {
        expect(result.current.error).toEqual(rejectValue);
      });
    });
  });
});
