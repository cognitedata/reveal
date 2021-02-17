import { screen } from '@testing-library/react';
import { QueryClient } from 'react-query';
import React from 'react';
import { Status } from '../../model/Status';
import { renderWithReQueryCacheSelectedIntegrationContext } from '../../utils/test/render';
import { ORIGIN_DEV, PROJECT_ITERA_INT_GREEN } from '../../utils/baseURL';
import { render } from '../../utils/test';
import { RunLogsView } from './RunLogsView';
import {
  getMockResponse,
  mockDataRunsResponse,
  mockError,
} from '../../utils/mockResponse';
import { useRuns } from '../../hooks/useRuns';
import { MonitoringTableHeadings } from '../table/MonitoringTableCol';
import { TableHeadings } from '../table/IntegrationTableCol';
import { RunTableHeading } from './RunLogsCols';

jest.mock('../../hooks/useRuns', () => {
  return {
    useRuns: jest.fn(),
  };
});
describe('RunLogsView', () => {
  it('renders error on request fail', () => {
    useRuns.mockReturnValue(mockError);
    const mockIntegration = getMockResponse()[0];
    const { wrapper } = renderWithReQueryCacheSelectedIntegrationContext(
      new QueryClient(),
      PROJECT_ITERA_INT_GREEN,
      PROJECT_ITERA_INT_GREEN,
      ORIGIN_DEV,
      undefined,
      '/'
    );
    render(<RunLogsView integration={mockIntegration} />, { wrapper });
    expect(screen.getByText(mockError.error.message)).toBeInTheDocument();
  });
  it('renders runs on success', () => {
    useRuns.mockReturnValue({ data: mockDataRunsResponse.items });
    const mockIntegration = getMockResponse()[0];
    const { wrapper } = renderWithReQueryCacheSelectedIntegrationContext(
      new QueryClient(),
      PROJECT_ITERA_INT_GREEN,
      PROJECT_ITERA_INT_GREEN,
      ORIGIN_DEV,
      undefined,
      '/'
    );
    render(<RunLogsView integration={mockIntegration} />, { wrapper });
    expect(
      screen.getByText(MonitoringTableHeadings.TIMESTAMP)
    ).toBeInTheDocument();
    expect(
      screen.getByText(new RegExp(TableHeadings.STATUS, 'i'))
    ).toBeInTheDocument();
    expect(screen.getByText(RunTableHeading.MESSAGE)).toBeInTheDocument();
    // check only failed are displayed by default
    expect(screen.getAllByText(Status.FAIL).length > 0).toEqual(true);
    expect(screen.queryByText(Status.OK)).not.toBeInTheDocument();
  });
});
