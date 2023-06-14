import { getMockResponse } from '@extraction-pipelines/utils/mockResponse';
import { renderWithReQueryCacheSelectedExtpipeContext } from '@extraction-pipelines/utils/test/render';
import { QueryClient } from '@tanstack/react-query';
import {
  ORIGIN_DEV,
  PROJECT_ITERA_INT_GREEN,
} from '@extraction-pipelines/utils/baseURL';
import { Schedule } from '@extraction-pipelines/components/extpipe/edit/Schedule';
import { render } from '@extraction-pipelines/utils/test';
import { TableHeadings } from '@extraction-pipelines/components/table/ExtpipeTableCol';
import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { parseCron } from '@extraction-pipelines/utils/cronUtils';
import { CRON_LABEL } from '@extraction-pipelines/components/inputs/cron/CronInput';
import { CLOSE } from '@extraction-pipelines/utils/constants';

describe('Schedule', () => {
  const mock = getMockResponse()[0];
  let wrapper;
  beforeEach(() => {
    wrapper = renderWithReQueryCacheSelectedExtpipeContext(
      new QueryClient(),
      PROJECT_ITERA_INT_GREEN,
      PROJECT_ITERA_INT_GREEN,
      ORIGIN_DEV,
      mock,
      '/'
    );
  });
  test.skip('Interact with component', async () => {
    render(
      <Schedule
        extpipe={mock}
        name="schedule"
        label={TableHeadings.SCHEDULE}
        canEdit
      />,
      { wrapper: wrapper.wrapper }
    );
    await waitFor(() => {
      screen.getByText(TableHeadings.SCHEDULE);
    });
    expect(screen.getByTestId('cron-title')).not.toBeInTheDocument();
    expect(screen.getByText(parseCron(mock.schedule))).toBeInTheDocument();
    const scheduleSelect = screen.getByText(parseCron(mock.schedule));
    fireEvent.click(scheduleSelect);
    expect(screen.getByTestId('cron-title')).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText(CLOSE));
    expect(screen.getByTestId('cron-title')).not.toBeInTheDocument();
  });

  test.skip('Show add when no schedule value', async () => {
    render(
      <Schedule
        extpipe={{
          name: mock.name,
          id: mock.id,
          externalId: mock.externalId,
        }}
        canEdit
        name="schedule"
        label={TableHeadings.SCHEDULE}
      />,
      { wrapper: wrapper.wrapper }
    );
    await waitFor(() => {
      screen.getByText(TableHeadings.SCHEDULE);
    });
    expect(screen.getByText(/add schedule/i)).toBeInTheDocument();
  });
});
