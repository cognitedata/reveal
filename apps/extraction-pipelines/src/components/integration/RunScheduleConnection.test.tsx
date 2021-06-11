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
  test('Renders information when last connected is more recent than latest run', async () => {
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
      screen.getByText(TableHeadings.LATEST_RUN_TIME);
    });
    expect(
      screen.getByText(parseCron(mockIntegration.schedule))
    ).toBeInTheDocument();
    // last run
    expect(
      screen.getByText(moment(mockIntegration.lastSuccess).fromNow())
    ).toBeInTheDocument();
    // last connected
    expect(
      screen.getByText(moment(mockIntegration.lastSeen).fromNow())
    ).toBeInTheDocument();
  });

  test('Renders information when last failure is also last connected', async () => {
    const mockIntegration = getMockResponse()[1];
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
      screen.getByText(TableHeadings.LATEST_RUN_TIME);
    });
    expect(
      screen.getByText(parseCron(mockIntegration.schedule))
    ).toBeInTheDocument();
    expect(
      screen.getAllByText(moment(mockIntegration.lastFailure).fromNow()).length
    ).toEqual(2); // last failure run + connected
  });

  test('Renders without integration', () => {
    renderWithSelectedIntegrationContext(<RunScheduleConnection />, {
      initIntegration: null,
      client: new QueryClient(),
    });
    expect(screen.getByText(TableHeadings.LATEST_RUN_TIME)).toBeInTheDocument();
    expect(screen.getByText(TableHeadings.SCHEDULE)).toBeInTheDocument();
    expect(screen.getByText(FAILED_PAST_WEEK_HEADING)).toBeInTheDocument();
    expect(screen.getByText(TableHeadings.LAST_SEEN)).toBeInTheDocument();
  });
});
