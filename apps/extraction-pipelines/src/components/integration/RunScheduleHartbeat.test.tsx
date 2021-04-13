import { getMockResponse, mockDataRunsResponse } from 'utils/mockResponse';
import { renderWithSelectedIntegrationContext } from 'utils/test/render';
import { QueryClient } from 'react-query';
import { screen } from '@testing-library/react';
import { TableHeadings } from 'components/table/IntegrationTableCol';
import React from 'react';
import {
  GENERAL_INFO_LINK,
  INVESTIGATE_RUN_LINK,
  RUNS_OVERVIEW_LINK,
  RunScheduleHartbeat,
} from 'components/integration/RunScheduleHartbeat';
import { parseCron } from 'utils/cronUtils';
import { sdkv3 } from '@cognite/cdf-sdk-singleton';
import moment from 'moment';

describe('RunScheduleHartbeat', () => {
  test('Renders information', () => {
    const mockIntegration = getMockResponse()[0];
    sdkv3.get.mockResolvedValue({
      data: { items: mockDataRunsResponse.items },
    });
    renderWithSelectedIntegrationContext(<RunScheduleHartbeat />, {
      initIntegration: mockIntegration,
      client: new QueryClient(),
    });
    expect(
      screen.getByText(parseCron(mockIntegration.schedule))
    ).toBeInTheDocument();
    expect(
      screen.getByText(moment(mockIntegration.lastSeen).fromNow())
    ).toBeInTheDocument();
  });

  test('Renders without integration', () => {
    renderWithSelectedIntegrationContext(<RunScheduleHartbeat />, {
      initIntegration: null,
      client: new QueryClient(),
    });
    expect(screen.getByText(INVESTIGATE_RUN_LINK)).toBeInTheDocument();
    expect(screen.getByText(GENERAL_INFO_LINK)).toBeInTheDocument();
    expect(screen.getByText(TableHeadings.SCHEDULE)).toBeInTheDocument();
    expect(screen.getByText(RUNS_OVERVIEW_LINK)).toBeInTheDocument();
  });
});
