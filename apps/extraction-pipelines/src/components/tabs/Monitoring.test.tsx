import { sdkv3 } from '@cognite/cdf-sdk-singleton';
import { screen, render } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import React from 'react';
import { QueryCache } from 'react-query';
import { mockError, getMockResponse } from '../../utils/mockResponse';
import Monitoring from '../tabs/Monitoring';
import {
  CDF_ENV_GREENFIELD,
  ORIGIN_DEV,
  PROJECT_ITERA_INT_GREEN,
  renderWithReQueryCacheSelectedIntegrationContext,
} from '../../utils/test/render';

describe('Monitoring', () => {
  const externalId = 'dataIntegration000-1';
  test('Render table with out fail', async () => {
    sdkv3.get.mockResolvedValue({ data: getMockResponse() });
    render(<Monitoring externalId={externalId} />);
    const sidePanelHeading = screen.getByRole('table');
    expect(sidePanelHeading).toBeInTheDocument();
  });

  test('Render error on fail', async () => {
    sdkv3.get.mockRejectedValue(mockError);
    const queryCache = new QueryCache({
      defaultConfig: {
        queries: {
          retry: false,
        },
      },
    });
    await act(async () => {
      const wrapper = renderWithReQueryCacheSelectedIntegrationContext(
        queryCache,
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
