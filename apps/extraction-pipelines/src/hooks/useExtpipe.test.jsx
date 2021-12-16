import { QueryClient } from 'react-query';
import { act, renderHook } from '@testing-library/react-hooks';
import { useSDK } from '@cognite/sdk-provider'; // eslint-disable-line
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
import { useExtpipeById } from 'hooks/useExtpipe';

describe('useExtpipe', () => {
  const mockExtpipe = getMockResponse()[0];
  const mockDataSet = mockDataSetResponse()[0];
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
      get: () => Promise.resolve({ data: mockExtpipe }),
      datasets: {
        retrieve: () => Promise.resolve([mockDataSet]),
      },
    });

    const { result, waitFor } = renderHook(
      () => useExtpipeById(mockExtpipe.id),
      {
        wrapper,
      }
    );
    await waitFor(() => {
      return result.current.isSuccess;
    });
    const extpipe = result?.current?.data;

    expect(extpipe.dataSetId).toEqual(extpipe?.dataSet?.id);
  });

  test('Returns extpipe without data set if get data set fails', async () => {
    useSDK.mockReturnValue({
      get: () => Promise.resolve({ data: mockExtpipe }),
      datasets: {
        retrieve: () => Promise.reject(rejectValue),
      },
    });
    const { result, waitFor } = renderHook(
      () => useExtpipeById(mockExtpipe.id),
      {
        wrapper,
      }
    );
    await act(async () => {
      await waitFor(() => {
        return result.current.isSuccess;
      });
    });
    const extpipe = result?.current?.data;

    expect(extpipe.dataSetId).toBeDefined();
    expect(extpipe.dataSet).toBeUndefined();
  });

  test('Returns error on fail', async () => {
    useSDK.mockReturnValue({
      get: () => Promise.reject(rejectValue),
    });

    const { result, waitFor } = renderHook(
      () => useExtpipeById(mockExtpipe.id),
      {
        wrapper,
      }
    );
    await waitFor(() => {
      return result.current.isError;
    });
    expect(result.current.error).toEqual(rejectValue);
  });
});
