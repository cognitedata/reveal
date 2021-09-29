import { sdkv3 } from '@cognite/cdf-sdk-singleton';
import { QueryClient } from 'react-query';
import { screen, waitFor } from '@testing-library/react';
import React from 'react';
import { getMockResponse } from 'utils/mockResponse';
import { renderWithSelectedIntegrationContext } from 'utils/test/render';
import IntegrationsTable from 'components/integrations/IntegrationsTable';

describe('IntegrationsTable', () => {
  test('Render table with out fail', async () => {
    sdkv3.get.mockResolvedValue({ data: { items: getMockResponse() } });
    const client = new QueryClient();
    renderWithSelectedIntegrationContext(
      <IntegrationsTable tableData={getMockResponse()} />,
      {
        initIntegration: null,
        client,
      }
    );
    await waitFor(() => {
      const sidePanelHeading = screen.getByRole('grid');
      expect(sidePanelHeading).toBeInTheDocument();
    });
  });
});
