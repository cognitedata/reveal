import { QueryClient } from 'react-query';
import { renderHook, act } from '@testing-library/react-hooks';
import { sdkv3 } from '@cognite/cdf-sdk-singleton';
import { renderWithReactQueryCacheProvider } from 'utils/test/render';
import {
  mockError,
  getMockResponse,
  mockDataSetResponse,
} from 'utils/mockResponse';
import {
  CDF_ENV_GREENFIELD,
  ORIGIN_DEV,
  PROJECT_ITERA_INT_GREEN,
} from 'utils/baseURL';
import { useIntegrationById } from 'hooks/useIntegration';

describe('useIntegration', () => {
  const mockIntegration = getMockResponse()[0];
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
  test('Returns integrations on success', async () => {
    sdkv3.get.mockResolvedValue({ data: mockIntegration });
    sdkv3.datasets.retrieve.mockResolvedValue([mockDataSet]);

    const { result, waitFor } = renderHook(
      () => useIntegrationById(mockIntegration.id),
      {
        wrapper,
      }
    );
    await waitFor(() => {
      return result.current.isSuccess;
    });
    const integration = result?.current?.data;

    expect(integration.dataSetId).toEqual(integration?.dataSet?.id);
  });

  test('Returns integration without data set if get data set fails', async () => {
    sdkv3.get.mockResolvedValue({
      data: mockIntegration,
    });
    sdkv3.datasets.retrieve.mockRejectedValue(rejectValue);
    const { result, waitFor } = renderHook(
      () => useIntegrationById(mockIntegration.id),
      {
        wrapper,
      }
    );
    await act(async () => {
      await waitFor(() => {
        return result.current.isSuccess;
      });
    });
    const integration = result?.current?.data;

    expect(integration.dataSetId).toBeDefined();
    expect(integration.dataSet).toBeUndefined();
  });

  test('Returns error on fail', async () => {
    sdkv3.get.mockRejectedValue(rejectValue);

    const { result, waitFor } = renderHook(
      () => useIntegrationById(mockIntegration.id),
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
