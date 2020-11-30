import { sdkv3 } from '@cognite/cdf-sdk-singleton';
import { QueryCache } from 'react-query';
import { screen, waitFor } from '@testing-library/react';
import React from 'react';
import { mockError, getMockResponse } from '../../utils/mockResponse';
import {
  CDF_ENV_GREENFIELD,
  ORIGIN_DEV,
  PROJECT_ITERA_INT_GREEN,
  renderWithReactQueryCacheProvider,
  renderWithSelectedIntegrationContext,
} from '../../utils/test/render';
import IntegrationsTable from './IntegrationsTable';

describe('IntegrationsTable', () => {
  test('Render table with out fail', async () => {
    sdkv3.get.mockResolvedValue({ data: { items: getMockResponse() } });
    const queryCache = new QueryCache();
    const wrapper = renderWithReactQueryCacheProvider(
      queryCache,
      PROJECT_ITERA_INT_GREEN,
      ORIGIN_DEV,
      CDF_ENV_GREENFIELD
    );
    renderWithSelectedIntegrationContext(<IntegrationsTable />, {
      wrapper,
      initIntegration: null,
    });
    await waitFor(() => {
      const sidePanelHeading = screen.getByRole('table');
      expect(sidePanelHeading).toBeInTheDocument();
    });
  });

  test('Render error on fail', async () => {
    sdkv3.get.mockRejectedValue(mockError);
    const queryCache = new QueryCache();
    const wrapper = renderWithReactQueryCacheProvider(
      queryCache,
      ORIGIN_DEV,
      PROJECT_ITERA_INT_GREEN,
      CDF_ENV_GREENFIELD
    );
    renderWithSelectedIntegrationContext(<IntegrationsTable />, {
      wrapper,
      initIntegration: null,
    });
    await waitFor(() => {
      const errorMessage = screen.getByText(
        /Multiple authentication headers present/i
      );
      expect(errorMessage).toBeInTheDocument();
    });
  });
});
