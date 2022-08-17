import React from 'react';
import {
  getMockResponse,
  mockDataRunsResponse,
  mockDataSetResponse,
} from 'utils/mockResponse';
import { renderWithSelectedExtpipeContext } from 'utils/test/render';
import { QueryClient } from 'react-query';
import { render, screen, waitFor } from '@testing-library/react';
import { TableHeadings } from 'components/table/ExtpipeTableCol';
import {
  RunScheduleConnection,
} from 'components/extpipe/RunScheduleConnection';
import { parseCron } from 'utils/cronUtils';
import { useSDK } from '@cognite/sdk-provider';
import moment from 'moment';
import { renderError } from 'components/extpipe/ExtpipeRunHistory';
import { FAILED_PAST_WEEK_HEADING } from "common/test"

describe('RunScheduleConnection', () => {
  test('Renders information when last connected is more recent than latest run', async () => {
    const mockExtpipe = getMockResponse()[0];
    const mockDataSet = mockDataSetResponse()[0];
    useSDK.mockReturnValue({
      get: jest
        .fn()
        .mockResolvedValueOnce({
          data: mockExtpipe,
        })
        .mockResolvedValueOnce({
          data: { items: mockDataRunsResponse.items },
        }),
      datasets: {
        retrieve: () => Promise.resolve([mockDataSet]),
      },
    });
    renderWithSelectedExtpipeContext(<RunScheduleConnection />, {
      initExtpipe: mockExtpipe,
      client: new QueryClient(),
    });
    await waitFor(() => {
      screen.getByText(TableHeadings.LATEST_RUN_TIME);
    });
    expect(
      screen.getByText(parseCron(mockExtpipe.schedule))
    ).toBeInTheDocument();
    // last run
    expect(
      screen.getByText(moment(mockExtpipe.lastSuccess).fromNow())
    ).toBeInTheDocument();
    // last connected
    expect(
      screen.getByText(moment(mockExtpipe.lastSeen).fromNow())
    ).toBeInTheDocument();
  });

  test('Renders information when last failure is also last connected', async () => {
    const mockExtpipe = getMockResponse()[1];
    const mockDataSet = mockDataSetResponse()[0];
    useSDK.mockReturnValue({
      get: jest
        .fn()
        .mockResolvedValueOnce({
          data: mockExtpipe,
        })
        .mockResolvedValueOnce({
          data: { items: mockDataRunsResponse.items },
        }),
      datasets: {
        retrieve: () => Promise.resolve([mockDataSet]),
      },
    });
    renderWithSelectedExtpipeContext(<RunScheduleConnection />, {
      initExtpipe: mockExtpipe,
      client: new QueryClient(),
    });
    await waitFor(() => {
      screen.getByText(TableHeadings.LATEST_RUN_TIME);
    });
    expect(
      screen.getByText(parseCron(mockExtpipe.schedule))
    ).toBeInTheDocument();
    expect(
      screen.getAllByText(moment(mockExtpipe.lastFailure).fromNow()).length
    ).toEqual(2); // last failure run + connected
  });

  test('On run history page, get an error box if you lack permissions', async () => {
    const err = new Error('Failed because its forbidden');
    err.status = 403;
    render(renderError(err));
    expect(
      screen.queryByText(
        'You have insufficient access rights to access this feature'
      )
    ).toBeInTheDocument();
  });

  test('Not see error if its a different code than 403', async () => {
    const err = new Error('Failed because its forbidden');
    err.status = 404;
    render(renderError(err));
    expect(
      screen.queryByText(
        'You have insufficient access rights to access this feature'
      )
    ).not.toBeInTheDocument();
  });

  test('Renders without extpipe', () => {
    renderWithSelectedExtpipeContext(<RunScheduleConnection />, {
      initExtpipe: null,
      client: new QueryClient(),
    });
    expect(screen.getByText(TableHeadings.LATEST_RUN_TIME)).toBeInTheDocument();
    expect(screen.getByText(TableHeadings.SCHEDULE)).toBeInTheDocument();
    expect(
      screen.queryByText(FAILED_PAST_WEEK_HEADING)

    ).not.toBeInTheDocument();
    expect(screen.getByText(TableHeadings.LAST_SEEN)).toBeInTheDocument();
  });
});
