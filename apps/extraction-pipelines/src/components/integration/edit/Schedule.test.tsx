import { getMockResponse } from 'utils/mockResponse';
import { renderWithReQueryCacheSelectedIntegrationContext } from 'utils/test/render';
import { QueryClient } from 'react-query';
import { ORIGIN_DEV, PROJECT_ITERA_INT_GREEN } from 'utils/baseURL';
import { Schedule } from 'components/integration/edit/Schedule';
import { render } from 'utils/test';
import { TableHeadings } from 'components/table/IntegrationTableCol';
import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { parseCron } from 'utils/cronUtils';
import { CRON_LABEL } from 'components/inputs/cron/CronInput';
import { CLOSE } from 'utils/constants';

describe('Schedule', () => {
  const mock = getMockResponse()[0];
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
  test('Interact with component', async () => {
    render(
      <Schedule
        integration={mock}
        name="schedule"
        label={TableHeadings.SCHEDULE}
        canEdit
      />,
      { wrapper: wrapper.wrapper }
    );
    await waitFor(() => {
      screen.getByText(TableHeadings.SCHEDULE);
    });
    expect(screen.queryByText(CRON_LABEL)).not.toBeInTheDocument();
    expect(screen.getByText(parseCron(mock.schedule))).toBeInTheDocument();
    const scheduleSelect = screen.getByText(parseCron(mock.schedule));
    fireEvent.click(scheduleSelect);
    expect(screen.getByText(CRON_LABEL)).toBeInTheDocument();
    fireEvent.click(screen.getByLabelText(CLOSE));
    expect(screen.queryByText(CRON_LABEL)).not.toBeInTheDocument();
  });

  test('Show add when no schedule value', async () => {
    render(
      <Schedule
        integration={{
          name: mock.name,
          id: mock.id,
          externalId: mock.externalId,
        }}
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
