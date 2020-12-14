import { sdkv3 } from '@cognite/cdf-sdk-singleton';
import { screen, render } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';
import { act } from 'react-dom/test-utils';
import React from 'react';
import { useRuns } from '../../hooks/useRuns';
import { mockError, getMockResponse } from '../../utils/mockResponse';
import Monitoring from '../tabs/Monitoring';

describe('Monitoring', () => {
  const externalId = 'dataIntegration000-1';
  test('Render table with out fail', async () => {
    sdkv3.get.mockResolvedValue({ data: getMockResponse() });
    render(<Monitoring externalId={externalId} />);
    const sidePanelHeading = screen.getByRole('table');
    expect(sidePanelHeading).toBeInTheDocument();
  });

  test('Render error on fail', async () => {
    jest.setTimeout(10000);
    sdkv3.get.mockRejectedValue(mockError);
    render(<Monitoring externalId={externalId} />);

    await act(async () => {
      const { waitFor } = renderHook(() => useRuns(externalId));
      await waitFor(() => {
        const errorMessage = screen.getByText(
          /Multiple authentication headers present/i
        );
        expect(errorMessage).toBeInTheDocument();
      });
    });
  });
});
