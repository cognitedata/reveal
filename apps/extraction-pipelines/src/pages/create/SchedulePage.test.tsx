import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { QueryClient } from 'react-query';
import { sdkv3 } from '@cognite/cdf-sdk-singleton';
import { renderRegisterContext } from '../../utils/test/render';
import {
  CDF_ENV_GREENFIELD,
  ORIGIN_DEV,
  PROJECT_ITERA_INT_GREEN,
} from '../../utils/baseURL';
import SchedulePage, { INTEGRATION_SCHEDULE_HEADING } from './SchedulePage';
import { SupportedScheduleStrings } from '../../components/integrations/cols/Schedule';
import { CRON_INVALID } from '../../utils/validation/cronValidation';
import { CRON_LABEL } from '../../components/inputs/cron/CronInput';
import { NEXT } from '../../utils/constants';
import { parseCron } from '../../utils/cronUtils';
import {
  DATA_SET_PAGE_PATH,
  SCHEDULE_PAGE_PATH,
} from '../../routing/CreateRouteConfig';

describe('SchedulePage', () => {
  const props = {
    client: new QueryClient(),
    project: PROJECT_ITERA_INT_GREEN,
    cdfEnv: CDF_ENV_GREENFIELD,
    origin: ORIGIN_DEV,
    route: `/:tenant${SCHEDULE_PAGE_PATH}`,
    initRegisterIntegration: {},
  };
  afterEach(() => {
    jest.resetAllMocks();
  });
  test('Renders', () => {
    renderRegisterContext(<SchedulePage />, { ...props });
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
    sdkv3.post.mockResolvedValue({
      data: { items: [{ name: 'myname', id: 123123 }] },
    });
    const { history } = renderRegisterContext(<SchedulePage />, {
      ...props,
      initRegisterIntegration: { id: 123123123 },
    });
    const onTriggerInput = screen.getByLabelText(
      SupportedScheduleStrings.ON_TRIGGER
    );
    fireEvent.click(onTriggerInput);
    await waitFor(() => {
      expect(onTriggerInput.getAttribute('aria-checked')).toEqual('true');
    });

    const scheduled = screen.getByLabelText(SupportedScheduleStrings.SCHEDULED);
    fireEvent.click(scheduled);
    await waitFor(() => {
      screen.getByLabelText(CRON_LABEL);
    });
    const cron = screen.getByLabelText(CRON_LABEL);
    expect(cron).toBeInTheDocument();

    const invalid = '0 0 9';
    fireEvent.change(cron, { target: { value: invalid } });
    fireEvent.click(screen.getByText(NEXT));
    await waitFor(() => {
      screen.getByText(new RegExp(CRON_INVALID, 'i'));
    });

    const value = '0 0 9 1/1 * ? *';
    fireEvent.change(cron, { target: { value } });
    expect(screen.getByDisplayValue(value)).toBeInTheDocument();
    expect(screen.getByText(parseCron(value))).toBeInTheDocument();
    fireEvent.click(screen.getByText(NEXT));
    await waitFor(() => {
      expect(sdkv3.post).toHaveBeenCalledTimes(1);
    });
    expect(history.location.pathname.includes(DATA_SET_PAGE_PATH)).toEqual(
      true
    );
  });
});
