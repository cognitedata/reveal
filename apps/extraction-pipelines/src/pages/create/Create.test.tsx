import { QueryClient } from 'react-query';
import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { sdkv3 } from '@cognite/cdf-sdk-singleton';
import { renderRegisterContext } from '../../utils/test/render';
import Create from './Create';
import {
  CDF_ENV_GREENFIELD,
  ORIGIN_DEV,
  PROJECT_ITERA_INT_GREEN,
} from '../../utils/baseURL';
import {
  CREATE_INTEGRATION_HEADING,
  EMAIL_LABEL,
  NAME_LABEL,
  NEXT,
} from '../../utils/constants';
import {
  CREATE_INTEGRATION_PAGE_PATH,
  SCHEDULE_PAGE_PATH,
} from '../../routing/CreateRouteConfig';
import '../../utils/test/windowLocation';
import { INTEGRATION_DOCUMENTATION_HEADING } from './DocumentationPage';
import { INTEGRATION_SCHEDULE_HEADING } from './SchedulePage';
import { SupportedScheduleStrings } from '../../components/integrations/cols/Schedule';
import { DataSetOptions, INTEGRATION_DATA_SET_HEADING } from './DataSetPage';
import { INTEGRATION_RAW_TABLE_HEADING, RawTableOptions } from './RawTablePage';
import { INTEGRATION_NAME_HEADING } from './NamePage';
import { INTEGRATION_EXTERNAL_ID_HEADING } from './ExternalIdPage';
import { INTEGRATION_CONTACTS_HEADING } from './ContactsPage';
import { CRON_LABEL } from '../../components/inputs/cron/CronInput';

describe('Register', () => {
  window.location.href =
    'https://dev.fusion.cogniteapp.com/itera-int-green/integrations/create?env=greenfield';

  const props = {
    client: new QueryClient(),
    project: PROJECT_ITERA_INT_GREEN,
    cdfEnv: CDF_ENV_GREENFIELD,
    origin: ORIGIN_DEV,
    route: `/:tenant${CREATE_INTEGRATION_PAGE_PATH}`,
    initRegisterIntegration: {},
  };
  test('Navigation - simple path', async () => {
    sdkv3.post.mockResolvedValue({
      data: { items: [{ name: 'My integration' }] },
    });
    renderRegisterContext(
      <React.Suspense fallback="This is the fallback">
        <Create />
      </React.Suspense>,
      { ...props }
    );

    const lazyElement = await screen.findByText(CREATE_INTEGRATION_HEADING);
    expect(lazyElement).toBeInTheDocument();
    fireEvent.click(screen.getByText(NEXT));

    // // name page
    await waitFor(() => {
      screen.getByLabelText(INTEGRATION_NAME_HEADING);
    });
    const nameInput = await screen.findByLabelText(INTEGRATION_NAME_HEADING);
    const name = 'My integration';
    fireEvent.change(nameInput, { target: { value: name } });
    await waitFor(() => {
      screen.getByText(NEXT);
    });
    fireEvent.click(screen.getByText(NEXT));

    // external id page
    await waitFor(() => {
      screen.getByLabelText(INTEGRATION_EXTERNAL_ID_HEADING);
    });
    expect(
      screen.getByLabelText(INTEGRATION_EXTERNAL_ID_HEADING)
    ).toBeInTheDocument();
    fireEvent.click(screen.getByText(/back/i));

    // name page
    await waitFor(() => {
      screen.getByLabelText(/name/i);
    });
    const nameInputDisplay = screen.getByDisplayValue(name);
    expect(nameInputDisplay).toBeInTheDocument();
    fireEvent.click(screen.getByText(NEXT));

    // external id page
    await waitFor(() => {
      screen.getByLabelText(INTEGRATION_EXTERNAL_ID_HEADING);
    });
    const externalId = 'external_id_001';
    const externalIdInput = screen.getByLabelText(
      INTEGRATION_EXTERNAL_ID_HEADING
    );
    fireEvent.change(externalIdInput, {
      target: { value: externalId },
    });
    fireEvent.click(screen.getByText(NEXT));

    // contacts page
    await waitFor(() => {
      screen.getByText(INTEGRATION_CONTACTS_HEADING);
    });
    const contactName = 'My name';
    const contactNameInput = screen.getByLabelText(NAME_LABEL);
    fireEvent.change(contactNameInput, {
      target: { value: contactName },
    });
    const contactEmail = 'my@email.com';
    const contactEmailInput = screen.getByLabelText(EMAIL_LABEL);
    fireEvent.change(contactEmailInput, {
      target: { value: contactEmail },
    });
    fireEvent.click(screen.getByText(NEXT));

    // schedule page
    await waitFor(() => {
      screen.getByText(INTEGRATION_SCHEDULE_HEADING);
    });
    const triggerOption = screen.getByLabelText(
      SupportedScheduleStrings.ON_TRIGGER
    );
    fireEvent.click(triggerOption);
    fireEvent.click(screen.getByText(NEXT));

    // data set page
    await waitFor(() => {
      screen.getByText(INTEGRATION_DATA_SET_HEADING);
    });
    const datasetOption = screen.getByLabelText(DataSetOptions.NO);
    fireEvent.click(datasetOption);
    fireEvent.click(screen.getByText(NEXT));

    // data set page
    await waitFor(() => {
      screen.getByText(INTEGRATION_RAW_TABLE_HEADING);
    });
    const rawOption = screen.getByLabelText(RawTableOptions.NO);
    fireEvent.click(rawOption);
    fireEvent.click(screen.getByText(NEXT));

    // documentation page
    await waitFor(() => {
      screen.getByText(INTEGRATION_DOCUMENTATION_HEADING);
    });
  });

  test('Navigation - from schedule page', async () => {
    renderRegisterContext(
      <React.Suspense fallback="This is the fallback">
        <Create />
      </React.Suspense>,
      { ...props, route: `/:tenant${SCHEDULE_PAGE_PATH}` }
    );

    // schedule page
    await waitFor(() => {
      screen.getByText(INTEGRATION_SCHEDULE_HEADING);
    });

    // option NOT_DEFINED
    const notDefinedOption = screen.getByLabelText(
      SupportedScheduleStrings.NOT_DEFINED
    );
    fireEvent.click(notDefinedOption);
    fireEvent.click(screen.getByText(NEXT));

    await waitFor(() => {
      screen.getByText(INTEGRATION_DATA_SET_HEADING);
    });
    fireEvent.click(screen.getByText(/back/i));

    // option ON_TRIGGER
    const triggerOption = screen.getByLabelText(
      SupportedScheduleStrings.ON_TRIGGER
    );
    fireEvent.click(triggerOption);
    fireEvent.click(screen.getByText(NEXT));

    // data set page
    await waitFor(() => {
      screen.getByText(INTEGRATION_DATA_SET_HEADING);
    });
    fireEvent.click(screen.getByText(/back/i));

    // option CONTINUOUS
    const continuousOption = screen.getByLabelText(
      SupportedScheduleStrings.CONTINUOUS
    );
    fireEvent.click(continuousOption);
    fireEvent.click(screen.getByText(NEXT));

    // data set page
    await waitFor(() => {
      screen.getByText(INTEGRATION_DATA_SET_HEADING);
    });
    fireEvent.click(screen.getByText(/back/i));

    // option SCHEDULED
    const scheduledOption = screen.getByLabelText(
      SupportedScheduleStrings.SCHEDULED
    );
    fireEvent.click(scheduledOption);
    const value = '0 0 9 1/1 * ? *';
    fireEvent.change(screen.getByLabelText(CRON_LABEL), { target: { value } });
    fireEvent.click(screen.getByText(NEXT));

    // cron page
    await waitFor(() => {
      screen.getByText(INTEGRATION_DATA_SET_HEADING);
    });
  });
});
