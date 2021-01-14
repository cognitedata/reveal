import { QueryClient } from 'react-query';
import { act, renderHook } from '@testing-library/react-hooks';
import { sdkv3 } from '@cognite/cdf-sdk-singleton';
import { renderWithReactQueryCacheProvider } from '../../utils/test/render';
import { useDetailsUpdate } from './useDetailsUpdate';
import { getMockResponse, mockError } from '../../utils/mockResponse';
import { IntegrationUpdateSpec } from '../../utils/IntegrationsAPI';
import {
  CDF_ENV_GREENFIELD,
  ORIGIN_DEV,
  PROJECT_ITERA_INT_GREEN,
} from '../../utils/baseURL';

describe('useDetailsUpdate', () => {
  let client: QueryClient;
  let wrapper;
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

    const { result } = renderHook(() => useDetailsUpdate(), {
      wrapper,
    });
    const { mutateAsync } = result.current;
    const id = 1;
    const items: IntegrationUpdateSpec[] = [
      {
        id,
        update: {},
      },
    ];
    expect(client.getQueryCache().find).toHaveBeenCalledTimes(0);
    await act(() => {
      return mutateAsync({ project: PROJECT_ITERA_INT_GREEN, items, id });
    });
    expect(result.current.data.owner).toEqual(integrationsResponse.owner);
    expect(client.invalidateQueries).toHaveBeenCalledTimes(1);
  });

  test('Returns error on fail', async () => {
    sdkv3.post.mockRejectedValue(mockError);

    const { result } = renderHook(() => useDetailsUpdate(), {
      wrapper,
    });
    const { mutateAsync } = result.current;
    const id = 1;
    const items: IntegrationUpdateSpec[] = [
      {
        id,
        update: {},
      },
    ];
    expect(client.getQueryCache().find).toHaveBeenCalledTimes(0);
    await act(async () => {
      await expect(
        mutateAsync({ project: PROJECT_ITERA_INT_GREEN, items, id })
      ).rejects.toEqual(mockError);
    });
    expect(result.current.error).toEqual(mockError);
    expect(result.current.data).toBeUndefined();
    expect(client.invalidateQueries).toHaveBeenCalledTimes(1);
  });
});
