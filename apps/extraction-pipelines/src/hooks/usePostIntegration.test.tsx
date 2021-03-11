import { QueryClient } from 'react-query';
import { renderHook, act } from '@testing-library/react-hooks';
import { sdkv3 } from '@cognite/cdf-sdk-singleton';
import { renderWithReactQueryCacheProvider } from '../utils/test/render';
import { mockError, getMockResponse } from '../utils/mockResponse';
import {
  CDF_ENV_GREENFIELD,
  ORIGIN_DEV,
  PROJECT_ITERA_INT_GREEN,
} from '../utils/baseURL';
import { usePostIntegration } from './usePostIntegration';

describe('usePostIntegration', () => {
  let client: QueryClient;
  let wrapper;

  const integration = {
    name: 'Integration name',
    externalId: 'some_external_id',
  };
  beforeEach(() => {
    client = new QueryClient();
    client.invalidateQueries = jest.fn();
    client.getQueryCache().find = jest.fn();
    wrapper = renderWithReactQueryCacheProvider(
      client,
      ORIGIN_DEV,
      PROJECT_ITERA_INT_GREEN,
      CDF_ENV_GREENFIELD
    );
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  test('Returns integrations on success', async () => {
    const integrationsResponse = getMockResponse()[1];
    sdkv3.post.mockResolvedValue({ data: { items: [integrationsResponse] } });

    const { result } = renderHook(() => usePostIntegration(), {
      wrapper,
    });
    const { mutateAsync } = result.current;

    // expect(client.getQueryCache().find).toHaveBeenCalledTimes(0);
    await act(() => {
      return mutateAsync({ integrationInfo: integration });
    });
    expect(result.current.data.name).toEqual(integrationsResponse.name);
  });

  test('Returns error on fail', async () => {
    sdkv3.post.mockRejectedValue(mockError);

    const { result } = renderHook(() => usePostIntegration(), {
      wrapper,
    });
    const { mutateAsync } = result.current;
    await act(async () => {
      await expect(
        mutateAsync({ integrationInfo: integration })
      ).rejects.toEqual(mockError);
    });
    expect(result.current.error).toEqual(mockError);
    expect(result.current.data).toBeUndefined();
  });
});
