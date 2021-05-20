import { screen } from '@testing-library/react';
import { QueryClient } from 'react-query';
import React from 'react';
import { Status } from 'model/Status';
import { renderWithReQueryCacheSelectedIntegrationContext } from 'utils/test/render';
import { ORIGIN_DEV, PROJECT_ITERA_INT_GREEN } from 'utils/baseURL';
import { render } from 'utils/test';
import { IntegrationHealth } from 'components/integration/IntegrationHealth';
import {
  getMockResponse,
  mockDataRunsResponse,
  mockError,
} from 'utils/mockResponse';
import { useFilteredRuns } from 'hooks/useRuns';
import { TableHeadings } from 'components/table/IntegrationTableCol';
import { RunTableHeading } from 'components/integration/RunLogsCols';
import { trackUsage } from 'utils/Metrics';
import { SINGLE_INTEGRATION_RUNS } from 'utils/constants';

jest.mock('hooks/useRuns', () => {
  return {
    useFilteredRuns: jest.fn(),
  };
});
describe('RunLogsView', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('renders error on request fail', () => {
    useFilteredRuns.mockReturnValue(mockError);
    const mockIntegration = getMockResponse()[0];
    const { wrapper } = renderWithReQueryCacheSelectedIntegrationContext(
      new QueryClient(),
      PROJECT_ITERA_INT_GREEN,
      PROJECT_ITERA_INT_GREEN,
      ORIGIN_DEV,
      undefined,
      '/'
    );
    render(<IntegrationHealth integration={mockIntegration} />, { wrapper });
    expect(screen.getByText(mockError.error.message)).toBeInTheDocument();

    // test tracking
    expect(trackUsage).toHaveBeenCalledTimes(1);
    expect(trackUsage).toHaveBeenCalledWith(SINGLE_INTEGRATION_RUNS, {
      id: mockIntegration.id,
    });
  });

  it('renders runs on success', () => {
    useFilteredRuns.mockReturnValue({ data: mockDataRunsResponse });
    const mockIntegration = getMockResponse()[0];
    const { wrapper } = renderWithReQueryCacheSelectedIntegrationContext(
      new QueryClient(),
      PROJECT_ITERA_INT_GREEN,
      PROJECT_ITERA_INT_GREEN,
      ORIGIN_DEV,
      undefined,
      '/'
    );
    render(<IntegrationHealth integration={mockIntegration} />, { wrapper });
    expect(screen.getByText(RunTableHeading.TIMESTAMP)).toBeInTheDocument();
    expect(
      screen.getByText(`${TableHeadings.STATUS} - ALL`) // status filter btn
    ).toBeInTheDocument();
    expect(screen.getByText(TableHeadings.STATUS)).toBeInTheDocument();
    expect(screen.getByText(RunTableHeading.MESSAGE)).toBeInTheDocument();

    expect(screen.getAllByText(Status.FAIL).length).toEqual(2);
    expect(screen.getAllByText(Status.OK).length).toEqual(4);
  });
});
