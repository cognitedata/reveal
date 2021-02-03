import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { QueryClient } from 'react-query';
import render, {
  renderWithReQueryCacheSelectedIntegrationContext,
} from '../../utils/test/render';
import { ORIGIN_DEV, PROJECT_ITERA_INT_GREEN } from '../../utils/baseURL';
import SchedulePage, { INTEGRATION_SCHEDULE_HEADING } from './SchedulePage';
import { SupportedScheduleStrings } from '../../components/integrations/cols/Schedule';

describe('SchedulePage', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = renderWithReQueryCacheSelectedIntegrationContext(
      new QueryClient(),
      PROJECT_ITERA_INT_GREEN,
      PROJECT_ITERA_INT_GREEN,
      ORIGIN_DEV,
      undefined,
      `create/integration-contacts`
    );
    render(<SchedulePage />, { wrapper });
  });
  test('Renders', () => {
    expect(screen.getByText(INTEGRATION_SCHEDULE_HEADING)).toBeInTheDocument();
    expect(
      screen.getByLabelText(SupportedScheduleStrings.NOT_DEFINED)
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(SupportedScheduleStrings.ON_TRIGGER)
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(SupportedScheduleStrings.CONTINUOUS)
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(SupportedScheduleStrings.SCHEDULED)
    ).toBeInTheDocument();
  });

  test('Interact with form', async () => {
    const onTriggerInput = screen.getByLabelText(
      SupportedScheduleStrings.ON_TRIGGER
    );
    fireEvent.click(onTriggerInput);
    await waitFor(() => {
      expect(onTriggerInput.getAttribute('aria-checked')).toEqual('true');
    });
  });
});
