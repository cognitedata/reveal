import { QueryClient } from 'react-query';
import { act, renderHook } from '@testing-library/react-hooks';
import { useSDK } from '@cognite/sdk-provider'; // eslint-disable-line
import { renderWithReactQueryCacheProvider } from 'utils/test/render';
import { getMockResponse, mockError } from 'utils/mockResponse';
import {
  CDF_ENV_GREENFIELD,
  ORIGIN_DEV,
  PROJECT_ITERA_INT_GREEN,
} from 'utils/baseURL';
import { usePostExtpipe } from 'hooks/usePostExtpipe';

describe('usePostExtpipe', () => {
  let client;
  let wrapper;

  const extpipe = {
    name: 'Extpipe name',
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

  test('Returns extpipes on success', async () => {
    const extpipesResponse = getMockResponse()[1];
    useSDK.mockReturnValue({
      post: () => Promise.resolve({ data: { items: [extpipesResponse] } }),
    });

    const { result } = renderHook(() => usePostExtpipe(), {
      wrapper,
    });
    const { mutateAsync } = result.current;

    // expect(client.getQueryCache().find).toHaveBeenCalledTimes(0);
    await act(() => {
      return mutateAsync({ extpipeInfo: extpipe });
    });
    expect(result.current.data.name).toEqual(extpipesResponse.name);
  });

  test('Returns error on fail', async () => {
    useSDK.mockReturnValue({
      post: () => Promise.reject(mockError),
    });

    const { result } = renderHook(() => usePostExtpipe(), {
      wrapper,
    });
    const { mutateAsync } = result.current;
    await act(async () => {
      await expect(mutateAsync({ extpipeInfo: extpipe })).rejects.toEqual(
        mockError
      );
    });
    expect(result.current.error).toEqual(mockError);
    expect(result.current.data).toBeUndefined();
  });
});
