import { fireEvent, screen, waitFor } from '@testing-library/react';
import { QueryClient } from 'react-query';
import React from 'react';
import { RunStatusAPI, RunStatusUI } from 'model/Status';
import { renderWithReQueryCacheSelectedIntegrationContext } from 'utils/test/render';
import { ORIGIN_DEV, PROJECT_ITERA_INT_GREEN } from 'utils/baseURL';
import { render } from 'utils/test';
import {
  IntegrationHealth,
  PAGE_SIZE_DEFAULT,
} from 'components/integration/IntegrationHealth';
import {
  getMockResponse,
  mockDataRunsResponse,
  mockError,
} from 'utils/mockResponse';
import { useFilteredRuns } from 'hooks/useRuns';
import { TableHeadings } from 'components/table/IntegrationTableCol';
import { RunTableHeading } from 'components/integration/RunLogsCols';
import { trackUsage } from 'utils/Metrics';
import { SINGLE_EXT_PIPE_RUNS } from 'utils/constants';
import moment from 'moment';
import { rangeToTwoDigitString } from 'components/inputs/dateTime/TimeSelectorUtils';
import { DAYS_7 } from 'components/table/QuickDateTimeFilters';

jest.mock('hooks/useRuns', () => {
  return {
    useFilteredRuns: jest.fn(),
  };
});
describe('IntegrationHealth', () => {
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
    expect(trackUsage).toHaveBeenCalledWith(SINGLE_EXT_PIPE_RUNS, {
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
      screen.getByText(`${TableHeadings.LAST_RUN_STATUS} - ALL`) // status filter btn
    ).toBeInTheDocument();
    expect(screen.getByText(TableHeadings.LAST_RUN_STATUS)).toBeInTheDocument();
    expect(screen.getByText(RunTableHeading.MESSAGE)).toBeInTheDocument();

    expect(screen.getAllByText(RunStatusUI.FAILURE).length > 0).toEqual(true);
    expect(screen.getAllByText(RunStatusUI.SUCCESS).length > 0).toEqual(true);
    expect(screen.getAllByRole('row').length).toEqual(PAGE_SIZE_DEFAULT + 1); // rows + heading
  });

  it('interact with filter', async () => {
    useFilteredRuns.mockReturnValue({ data: mockDataRunsResponse });
    const mockIntegration = getMockResponse()[0];
    const route = '/health';
    const dateRange = {
      startDate: moment().subtract(1, 'hour').toDate(),
      endDate: moment().toDate(),
    };
    const searchString = 'searching error';
    const {
      wrapper,
      history,
    } = renderWithReQueryCacheSelectedIntegrationContext(
      new QueryClient(),
      PROJECT_ITERA_INT_GREEN,
      PROJECT_ITERA_INT_GREEN,
      ORIGIN_DEV,
      undefined,
      route,
      {
        dateRange,
        search: searchString,
        statuses: [RunStatusAPI.FAILURE],
      }
    );
    render(<IntegrationHealth integration={mockIntegration} />, { wrapper });
    // sets url from stored filter
    expect(history.location.pathname).toEqual(route);
    const params = new URLSearchParams(history.location.search);
    const startTime = new Date(parseInt(params.get('min'), 10));
    expect(startTime).toEqual(dateRange.startDate);
    const endTime = new Date(parseInt(params.get('max'), 10));
    expect(endTime).toEqual(dateRange.endDate);
    expect(params.get('search')).toEqual(searchString);
    expect(params.get('statuses')).toEqual(RunStatusAPI.FAILURE);

    // display set time range
    const statTimeString = rangeToTwoDigitString({
      hours: dateRange.startDate.getHours(),
      min: dateRange.startDate.getMinutes(),
    });
    const timeStartInput = screen.getByLabelText('Date range start time');
    expect(timeStartInput.value).toEqual(statTimeString);
    const endTimeString = rangeToTwoDigitString({
      hours: dateRange.endDate.getHours(),
      min: dateRange.endDate.getMinutes(),
    });
    const timeEndInput = screen.getByLabelText('Date range end time');
    expect(timeEndInput.value).toEqual(endTimeString);

    // display search
    expect(screen.getByDisplayValue(searchString)).toBeInTheDocument();

    // change status
    const statusFilterBtn = screen.getByTestId('status-menu-button');
    expect(statusFilterBtn).toBeInTheDocument();
    const statusFilterMarker = screen.getByTestId(
      'status-marker-status-menu-button-marker'
    );
    expect(statusFilterMarker.textContent).toEqual(RunStatusUI.FAILURE);
    fireEvent.click(statusFilterBtn);
    fireEvent.click(screen.getByTestId('status-marker-status-menu-ok'));
    await waitFor(() => {
      expect(history.location.search.includes(RunStatusAPI.SUCCESS)).toEqual(
        true
      );
    });

    // change search
    const newSearchString = 'foo';
    fireEvent.change(screen.getByDisplayValue(searchString), {
      target: { value: newSearchString },
    });
    await waitFor(() => {
      expect(history.location.search.includes(newSearchString)).toEqual(true);
    });
    fireEvent.click(screen.getByText(DAYS_7));
    const newStartDate = moment().subtract(7, 'days').toDate();
    await waitFor(() => {
      const searchParams = new URLSearchParams(history.location.search);
      expect(new Date(parseInt(searchParams.get('min'), 10)).getDay()).toEqual(
        newStartDate.getDay()
      );
    });
  });
});
