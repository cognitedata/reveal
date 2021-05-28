import React from 'react';
import { screen, waitFor } from '@testing-library/react';
import { getMockResponse, mockDataSetResponse } from 'utils/mockResponse';
import render, {
  renderWithReQueryCacheSelectedIntegrationContext,
} from 'utils/test/render';
import { QueryClient } from 'react-query';
import { ORIGIN_DEV, PROJECT_ITERA_INT_GREEN } from 'utils/baseURL';
import { sdkv3 } from '@cognite/cdf-sdk-singleton';
import { IntegrationHeading } from 'components/integration/IntegrationHeading';

describe('IntegrationHeading', () => {
  const mock = getMockResponse()[0];
  const mockDataSet = mockDataSetResponse()[0];
  let wrapper;
  beforeEach(() => {
    wrapper = renderWithReQueryCacheSelectedIntegrationContext(
      new QueryClient(),
      PROJECT_ITERA_INT_GREEN,
      PROJECT_ITERA_INT_GREEN,
      ORIGIN_DEV,
      mock,
      '/'
    );
  });
  test('Render with minimal info', async () => {
    const mockIntegration = {
      name: mock.name,
      id: mock.id,
      dataSetId: mock.dataSetId,
    };
    sdkv3.post.mockResolvedValue({ data: { items: [mockIntegration] } });
    sdkv3.get.mockResolvedValueOnce({ data: mockIntegration });
    sdkv3.datasets.retrieve.mockResolvedValue([mockDataSet]);
    render(<IntegrationHeading />, {
      wrapper: wrapper.wrapper,
    });
    await waitFor(() => {
      screen.getByText(mockIntegration.name);
    });
    expect(screen.getByText(mockIntegration.name)).toBeInTheDocument();
    expect(screen.getByText(mockDataSet.name)).toBeInTheDocument();
    expect(screen.getByText(/add source/i)).toBeInTheDocument();
    expect(screen.getByText(/add description/i)).toBeInTheDocument();
  });
});
