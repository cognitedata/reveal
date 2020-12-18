import { QueryCache } from 'react-query';
import { act, renderHook } from '@testing-library/react-hooks';
import { sdkv3 } from '@cognite/cdf-sdk-singleton';
import {
  CDF_ENV_GREENFIELD,
  ORIGIN_DEV,
  PROJECT_ITERA_INT_GREEN,
  renderWithReactQueryCacheProvider,
} from '../../utils/test/render';
import { useDetailsUpdate } from './useDetailsUpdate';
import { getMockResponse, mockError } from '../../utils/mockResponse';
import { IntegrationUpdateSpec } from '../../utils/IntegrationsAPI';

describe('useDetailsUpdate', () => {
  test('Returns integrations on success', async () => {
    const integrationsResponse = getMockResponse()[1];
    sdkv3.post.mockResolvedValue({ data: { items: [integrationsResponse] } });

    const queryCache = new QueryCache();
    queryCache.invalidateQueries = jest.fn();
    queryCache.getQuery = jest.fn();

    const wrapper = renderWithReactQueryCacheProvider(
      queryCache,
      ORIGIN_DEV,
      PROJECT_ITERA_INT_GREEN,
      CDF_ENV_GREENFIELD
    );
    const { result } = renderHook(() => useDetailsUpdate(), {
      wrapper,
    });
    const mutation = result.current[0];
    const id = 1;
    const items: IntegrationUpdateSpec[] = [
      {
        id,
        update: {},
      },
    ];
    expect(queryCache.getQuery).toHaveBeenCalledTimes(0);
    await act(() => {
      return mutation({ project: PROJECT_ITERA_INT_GREEN, items, id });
    });
    expect(result.current[1].data.owner).toEqual(integrationsResponse.owner);
    expect(queryCache.invalidateQueries).toHaveBeenCalledTimes(1);
  });

  test('Returns error on fail', async () => {
    sdkv3.post.mockRejectedValue(mockError);

    const queryCache = new QueryCache();
    queryCache.invalidateQueries = jest.fn();
    queryCache.getQuery = jest.fn();

    const wrapper = renderWithReactQueryCacheProvider(
      queryCache,
      ORIGIN_DEV,
      PROJECT_ITERA_INT_GREEN,
      CDF_ENV_GREENFIELD
    );
    const { result } = renderHook(() => useDetailsUpdate(), {
      wrapper,
    });
    const mutation = result.current[0];
    const id = 1;
    const items: IntegrationUpdateSpec[] = [
      {
        id,
        update: {},
      },
    ];
    expect(queryCache.getQuery).toHaveBeenCalledTimes(0);
    await act(() => {
      return mutation({ project: PROJECT_ITERA_INT_GREEN, items, id });
    });
    const [_, response] = result.current;
    expect(response.error).toEqual(mockError);
    expect(response.data).toBeUndefined();
    expect(queryCache.invalidateQueries).toHaveBeenCalledTimes(1);
  });
});
