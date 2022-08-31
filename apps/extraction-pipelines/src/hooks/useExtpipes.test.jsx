import { QueryClient } from 'react-query';
import { act, renderHook } from '@testing-library/react-hooks';
import { useSDK } from '@cognite/sdk-provider';
import { renderWithReactQueryCacheProvider } from 'utils/test/render';
import {
  getMockResponse,
  mockDataSetResponse,
  mockError,
} from 'utils/mockResponse';
import {
  CDF_ENV_GREENFIELD,
  ORIGIN_DEV,
  PROJECT_ITERA_INT_GREEN,
} from 'utils/baseURL';
import { useExtpipes } from './useExtpipes';

describe('useExtpipes', () => {
  const rejectValue = mockError;
  let wrapper;
  const client = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  beforeEach(() => {
    wrapper = renderWithReactQueryCacheProvider(
      client,
      ORIGIN_DEV,
      PROJECT_ITERA_INT_GREEN,
      CDF_ENV_GREENFIELD
    );
  });
  test('Returns extpipes on success', async () => {
    useSDK.mockReturnValue({
      get: () => Promise.resolve({ data: { items: getMockResponse() } }),
      datasets: {
        retrieve: () => Promise.resolve(mockDataSetResponse()),
      },
    });

    const { result, waitFor } = renderHook(() => useExtpipes(), {
      wrapper,
    });
    await waitFor(() => {
      return result.current.isSuccess;
    });
    const extpipes = result?.current?.data;

    //  no-unused-expressions
    extpipes?.forEach((extpipe) => {
      expect(extpipe.dataSetId).toEqual(extpipe?.dataSet?.id);
    });
  });

  test('Returns extpipe without data set if get data set fails', async () => {
    useSDK.mockReturnValue({
      get: () =>
        Promise.resolve({
          data: {
            items: getMockResponse().map(({ name, id, dataSetId }) => {
              return { id, name, dataSetId };
            }),
          },
        }),
      datasets: {
        retrieve: () => Promise.reject(rejectValue),
      },
    });

    const { result, waitFor } = renderHook(() => useExtpipes(), {
      wrapper,
    });
    await act(async () => {
      await waitFor(() => {
        return result.current.isSuccess;
      });
    });
    const extpipes = result?.current?.data;

    //  no-unused-expressions
    extpipes?.forEach((extpipe) => {
      expect(extpipe.dataSetId).toBeDefined();
      expect(extpipe.dataSet).toBeUndefined();
    });
  });

  test('Returns error on fail', async () => {
    useSDK.mockReturnValue({
      get: () => Promise.reject(rejectValue),
    });

    const { result, waitFor } = renderHook(() => useExtpipes(), {
      wrapper,
    });
    await waitFor(() => {
      return result.current.isError;
    });
    expect(result.current.error).toEqual(rejectValue);
  });
});
