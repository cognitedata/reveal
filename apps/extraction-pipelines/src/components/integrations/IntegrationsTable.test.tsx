import { sdkv3 } from '@cognite/cdf-sdk-singleton';
import { QueryClient } from 'react-query';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import React from 'react';
import { RunStatusUI } from 'model/Status';
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

  test('Open FailMessageModal', async () => {
    const modalRoot = document.createElement('div');
    modalRoot.setAttribute('class', 'integrations-ui-style-scope');
    document.body.appendChild(modalRoot);

    const mockData = getMockResponse();
    sdkv3.get.mockResolvedValue({ data: { items: mockData } });
    const client = new QueryClient();
    renderWithSelectedIntegrationContext(
      <IntegrationsTable tableData={mockData} />,
      {
        initIntegration: null,
        client,
      }
    );

    const failStatusButtons = screen.getAllByText(RunStatusUI.FAILURE);

    fireEvent.click(failStatusButtons[0]);

    const modal = screen.getByText('Fail message');
    expect(modal).toBeInTheDocument();

    const name = screen.getByTestId('details-name').textContent;
    expect(name).toBe('SAP Integration');

    const externalId = screen.getByText(/dataIntegration0002/i);
    expect(externalId).toBeInTheDocument();

    const closeBtn = screen.getByText('Close');
    fireEvent.click(closeBtn);
    expect(modal).not.toBeInTheDocument();
  });
});
