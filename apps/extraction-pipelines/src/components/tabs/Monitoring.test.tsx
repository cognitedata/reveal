import { sdkv3 } from '@cognite/cdf-sdk-singleton';
import { screen, waitFor, render } from '@testing-library/react';
import React from 'react';
import { mockError, getMockResponse } from '../../utils/mockResponse';
import Monitoring from '../tabs/Monitoring';

describe('Monitoring', () => {
  const externalId = 'dataIntegration000-1';
  test('Render table with out fail', async () => {
    sdkv3.get.mockResolvedValue({ data: { items: getMockResponse() } });
    render(<Monitoring externalId={externalId} />);
    await waitFor(() => {
      const sidePanelHeading = screen.getByRole('table');
      expect(sidePanelHeading).toBeInTheDocument();
    });
  });

  test('Render error on fail', async () => {
    sdkv3.get.mockRejectedValue(mockError);
    render(<Monitoring externalId={externalId} />);
    await waitFor(() => {
      const errorMessage = screen.getByText(
        /Multiple authentication headers present/i
      );
      expect(errorMessage).toBeInTheDocument();
    });
  });
});
