import {
  getMockResponse,
  mockDataRunsResponse,
  mockDataSetResponse,
} from 'utils/mockResponse';
import { renderWithSelectedIntegrationContext } from 'utils/test/render';
import { QueryClient } from 'react-query';
import { screen, waitFor } from '@testing-library/react';
import { TableHeadings } from 'components/table/IntegrationTableCol';
import React from 'react';
import {
  FAILED_PAST_WEEK_HEADING,
  RunScheduleConnection,
} from 'components/integration/RunScheduleConnection';
import { parseCron } from 'utils/cronUtils';
import { sdkv3 } from '@cognite/cdf-sdk-singleton';
import moment from 'moment';

describe('RunScheduleConnection', () => {
  test('Renders information', async () => {
    const mockIntegration = getMockResponse()[0];
    const mockDataSet = mockDataSetResponse()[0];
    sdkv3.get.mockResolvedValueOnce({
      data: mockIntegration,
    });
    sdkv3.datasets.retrieve.mockResolvedValue([mockDataSet]);
    sdkv3.get.mockResolvedValueOnce({
      data: { items: mockDataRunsResponse.items },
    });
    renderWithSelectedIntegrationContext(<RunScheduleConnection />, {
      initIntegration: mockIntegration,
      client: new QueryClient(),
    });
    await waitFor(() => {
      screen.getByText(TableHeadings.LATEST_RUN);
    });
    expect(
      screen.getByText(parseCron(mockIntegration.schedule))
    ).toBeInTheDocument();
    expect(
      screen.getByText(moment(mockIntegration.lastSeen).fromNow())
    ).toBeInTheDocument();
  });

  test('Renders without integration', () => {
    renderWithSelectedIntegrationContext(<RunScheduleConnection />, {
      initIntegration: null,
      client: new QueryClient(),
    });
    expect(screen.getByText(TableHeadings.LATEST_RUN)).toBeInTheDocument();
    expect(screen.getByText(TableHeadings.SCHEDULE)).toBeInTheDocument();
    expect(screen.getByText(FAILED_PAST_WEEK_HEADING)).toBeInTheDocument();
    expect(screen.getByText(TableHeadings.LAST_SEEN)).toBeInTheDocument();
  });
});
