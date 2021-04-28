import { QueryClient } from 'react-query';
import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { sdkv3 } from '@cognite/cdf-sdk-singleton';
import { renderRegisterContext } from 'utils/test/render';
import Create from 'pages/create/Create';
import {
  CDF_ENV_GREENFIELD,
  ORIGIN_DEV,
  PROJECT_ITERA_INT_GREEN,
} from 'utils/baseURL';
import { EMAIL_LABEL, NAME_LABEL, NEXT } from 'utils/constants';
import { NAME_PAGE_PATH, withTenant } from 'routing/CreateRouteConfig';
import 'utils/test/windowLocation';
import { INTEGRATION_DOCUMENTATION_HEADING } from 'pages/create/DocumentationPage';
import { INTEGRATION_SCHEDULE_HEADING } from 'pages/create/SchedulePage';
import {
  DataSetOptions,
  INTEGRATION_DATA_SET_HEADING,
} from 'pages/create/DataSetPage';
import {
  INTEGRATION_RAW_TABLE_HEADING,
  RawTableOptions,
} from 'pages/create/RawTablePage';
import { INTEGRATION_NAME_HEADING } from 'pages/create/NamePage';
import { INTEGRATION_EXTERNAL_ID_HEADING } from 'pages/create/ExternalIdPage';
import { TableHeadings } from 'components/table/IntegrationTableCol';

describe('Register', () => {
  window.location.href =
    'https://dev.fusion.cogniteapp.com/itera-int-green/integrations/create?env=greenfield';

  const props = {
    client: new QueryClient(),
    project: PROJECT_ITERA_INT_GREEN,
    cdfEnv: CDF_ENV_GREENFIELD,
    origin: ORIGIN_DEV,
    route: withTenant(NAME_PAGE_PATH),
    initRegisterIntegration: {},
  };
  beforeEach(() => {
    sdkv3.post.mockResolvedValue({
      data: { items: [{ name: 'My integration', id: 123 }] },
    });
  });
  afterEach(() => {
    jest.resetAllMocks();
  });
  test('Navigation - simple path', async () => {
    renderRegisterContext(
      <React.Suspense fallback="This is the fallback">
        <Create />
      </React.Suspense>,
      { ...props }
    );

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
      screen.getByText(TableHeadings.CONTACTS);
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
    const scheduleSelect = screen.getByLabelText('Schedule');
    fireEvent.click(scheduleSelect);
    fireEvent.keyDown(scheduleSelect, { key: 'Down', code: 'ArrowDown' });
    fireEvent.keyDown(scheduleSelect, { key: 'Down', code: 'ArrowDown' });
    fireEvent.keyDown(scheduleSelect, { key: 'Enter', code: 'Enter' });
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
});
