import { sdkv3 } from '@cognite/cdf-sdk-singleton';
import { screen, render } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import React from 'react';
import { QueryClient } from 'react-query';
import { mockError, getMockResponse } from '../../utils/mockResponse';
import Monitoring from '../tabs/Monitoring';
import {
  renderWithReactQueryCacheProvider,
  renderWithReQueryCacheSelectedIntegrationContext,
} from '../../utils/test/render';
import {
  CDF_ENV_GREENFIELD,
  ORIGIN_DEV,
  PROJECT_ITERA_INT_GREEN,
} from '../../utils/baseURL';

describe('Monitoring', () => {
  const externalId = 'dataIntegration000-1';
  test('Render table with out fail', async () => {
    sdkv3.get.mockResolvedValue({ data: getMockResponse() });
    const wrapper = renderWithReactQueryCacheProvider(
      new QueryClient(),
      PROJECT_ITERA_INT_GREEN,
      ORIGIN_DEV,
      CDF_ENV_GREENFIELD
    );
    render(<Monitoring externalId={externalId} />, { wrapper });
    const sidePanelHeading = screen.getByRole('table');
    expect(sidePanelHeading).toBeInTheDocument();
  });

  test('Render error on fail', async () => {
    sdkv3.get.mockRejectedValue(mockError);
    const client = new QueryClient({
      defaultOptions: {
        queries: {
          retry: false,
        },
      },
    });
    await act(async () => {
      const wrapper = renderWithReQueryCacheSelectedIntegrationContext(
        client,
        ORIGIN_DEV,
        PROJECT_ITERA_INT_GREEN,
        CDF_ENV_GREENFIELD
      );
      render(<Monitoring externalId={externalId} />, { wrapper });
      const errorMessage = await screen.findByText(mockError.error.message);
      expect(errorMessage).toBeInTheDocument();
    });
  });
});
