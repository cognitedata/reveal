import { sdkv3 } from '@cognite/cdf-sdk-singleton';
import { QueryCache } from 'react-query';
import { screen, waitFor } from '@testing-library/react';
import React from 'react';
import { mockError, mockResponse } from '../../utils/mockResponse';
import {
  renderWithReactQueryCacheProvider,
  renderWithSelectedIntegrationContext,
} from '../../utils/test/render';
import IntegrationsTable from './IntegrationsTable';

describe('IntegrationsTable', () => {
  const project = 'itera-int-green';
  const cdfEnv = 'greenfield';

  test('Render table with out fail', async () => {
    sdkv3.get.mockResolvedValue({ data: { items: mockResponse } });
    const queryCache = new QueryCache();
    const wrapper = renderWithReactQueryCacheProvider(
      queryCache,
      project,
      cdfEnv
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
      project,
      cdfEnv
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
