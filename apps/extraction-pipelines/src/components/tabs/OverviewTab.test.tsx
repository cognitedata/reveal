import { screen, waitFor } from '@testing-library/react';
import React from 'react';
import { sdkv3 } from '@cognite/cdf-sdk-singleton';
import { QueryClient } from 'react-query';
import { act } from '@testing-library/react-hooks';
import OverviewTab from './OverviewTab';
import { render } from '../../utils/test';
import { getMockResponse, unauthorizedError } from '../../utils/mockResponse';
import {
  renderWithReactQueryCacheProvider,
  renderWithReQueryCacheSelectedIntegrationContext,
} from '../../utils/test/render';
import {
  CDF_ENV_GREENFIELD,
  ORIGIN_DEV,
  PROJECT_ITERA_INT_GREEN,
} from '../../utils/baseURL';

describe('OverviewTab', () => {
  test('Render with out fail', async () => {
    sdkv3.get.mockResolvedValue({ data: { items: getMockResponse() } });
    const client = new QueryClient();
    const wrapper = renderWithReactQueryCacheProvider(
      client,
      ORIGIN_DEV,
      PROJECT_ITERA_INT_GREEN,
      CDF_ENV_GREENFIELD
    );
    render(<OverviewTab />, { wrapper });
    await waitFor(() => {
      const sidePanelHeading = screen.getByRole('grid');
      expect(sidePanelHeading).toBeInTheDocument();
    });
  });

  test('Should render no integrations message when no integrations', async () => {
    sdkv3.get.mockResolvedValue({ data: { items: [] } });
    const queryCache = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    await act(async () => {
      const wrapper = renderWithReQueryCacheSelectedIntegrationContext(
        queryCache,
        ORIGIN_DEV,
        PROJECT_ITERA_INT_GREEN,
        CDF_ENV_GREENFIELD
      );
      render(<OverviewTab />, { wrapper });
      const errorMessage = await screen.findByText(/No integration/i);
      expect(errorMessage).toBeInTheDocument();
    });
  });

  test('Render error on fail', async () => {
    sdkv3.get.mockRejectedValue(unauthorizedError);
    const queryCache = new QueryClient({
      defaultOptions: { queries: { retry: false } },
    });
    await act(async () => {
      const wrapper = renderWithReQueryCacheSelectedIntegrationContext(
        queryCache,
        ORIGIN_DEV,
        PROJECT_ITERA_INT_GREEN,
        CDF_ENV_GREENFIELD
      );
      render(<OverviewTab />, { wrapper });
      const errorMessage = await screen.findByText(
        unauthorizedError.data.message
      );
      expect(errorMessage).toBeInTheDocument();
    });
  });
});
