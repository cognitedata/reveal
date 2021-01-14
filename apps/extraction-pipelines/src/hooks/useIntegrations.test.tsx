import { QueryClient } from 'react-query';
import { renderHook, act } from '@testing-library/react-hooks';
import { sdkv3 } from '@cognite/cdf-sdk-singleton';
import { useIntegrations } from './useIntegrations';
import { renderWithReactQueryCacheProvider } from '../utils/test/render';
import { mockError, getMockResponse } from '../utils/mockResponse';
import {
  CDF_ENV_GREENFIELD,
  ORIGIN_DEV,
  PROJECT_ITERA_INT_GREEN,
} from '../utils/baseURL';

describe('useIntgrations', () => {
  test('Returns integrations on success', async () => {
    sdkv3.get.mockResolvedValue({ data: { items: getMockResponse() } });
    const client = new QueryClient();

    await act(async () => {
      const wrapper = renderWithReactQueryCacheProvider(
        client,
        ORIGIN_DEV,
        PROJECT_ITERA_INT_GREEN,
        CDF_ENV_GREENFIELD
      );
      const { result, waitFor } = renderHook(() => useIntegrations(), {
        wrapper,
      });
      await waitFor(() => {
        expect(result.current.data).toEqual(getMockResponse());
      });
    });
  });

  test('Returns error on fail', async () => {
    jest.setTimeout(10000);
    const rejectValue = mockError;
    sdkv3.get.mockRejectedValue(rejectValue);
    const client = new QueryClient();

    await act(async () => {
      const wrapper = renderWithReactQueryCacheProvider(
        client,
        PROJECT_ITERA_INT_GREEN,
        ORIGIN_DEV,
        CDF_ENV_GREENFIELD
      );
      const { result, waitFor } = renderHook(() => useIntegrations(), {
        wrapper,
      });
      await waitFor(() => {
        expect(result.current.error).toEqual(rejectValue);
      });
    });
  });
});
