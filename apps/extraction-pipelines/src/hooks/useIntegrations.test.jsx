import { QueryClient } from 'react-query';
import { act, renderHook } from '@testing-library/react-hooks';
import { sdkv3 } from '@cognite/cdf-sdk-singleton';
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
import { useIntegrations } from './useIntegrations';

describe('useIntegrations', () => {
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
  test('Returns integrations on success', async () => {
    sdkv3.get.mockResolvedValue({ data: { items: getMockResponse() } });
    sdkv3.datasets.retrieve.mockResolvedValue(mockDataSetResponse());

    const { result, waitFor } = renderHook(() => useIntegrations(), {
      wrapper,
    });
    await waitFor(() => {
      return result.current.isSuccess;
    });
    const integrations = result?.current?.data;

    // eslint-disable-next-line no-unused-expressions
    integrations?.forEach((integration) => {
      expect(integration.dataSetId).toEqual(integration?.dataSet?.id);
    });
  });

  test('Returns integration without data set if get data set fails', async () => {
    sdkv3.get.mockResolvedValue({
      data: {
        items: getMockResponse().map(({ name, id, dataSetId }) => {
          return { id, name, dataSetId };
        }),
      },
    });
    sdkv3.datasets.retrieve.mockRejectedValue(rejectValue);
    const { result, waitFor } = renderHook(() => useIntegrations(), {
      wrapper,
    });
    await act(async () => {
      await waitFor(() => {
        return result.current.isSuccess;
      });
    });
    const integrations = result?.current?.data;

    // eslint-disable-next-line no-unused-expressions
    integrations?.forEach((integration) => {
      expect(integration.dataSetId).toBeDefined();
      expect(integration.dataSet).toBeUndefined();
    });
  });

  test('Returns error on fail', async () => {
    sdkv3.get.mockRejectedValue(rejectValue);

    const { result, waitFor } = renderHook(() => useIntegrations(), {
      wrapper,
    });
    await waitFor(() => {
      return result.current.isError;
    });
    expect(result.current.error).toEqual(rejectValue);
  });
});
