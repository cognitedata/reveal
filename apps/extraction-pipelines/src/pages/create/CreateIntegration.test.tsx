import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { QueryClient } from 'react-query';
import { renderRegisterContext } from 'utils/test/render';
import { INTEGRATION_NAME_HEADING } from 'pages/create/NamePage';
import { SAVE } from 'utils/constants';
import {
  CDF_ENV_GREENFIELD,
  ORIGIN_DEV,
  PROJECT_ITERA_INT_GREEN,
} from 'utils/baseURL';
import { NAME_PATH } from 'routing/CreateRouteConfig';
import 'utils/test/windowLocation';
import CreateIntegration, {
  ADD_MORE_INFO_HEADING,
} from 'pages/create/CreateIntegration';
import {
  EXTERNAL_ID_REQUIRED,
  INTEGRATION_EXTERNAL_ID_HEADING,
} from 'pages/create/ExternalIdPage';
import { DESCRIPTION_LABEL } from 'pages/create/DocumentationPage';
import { NAME_REQUIRED } from 'utils/validation/integrationSchemas';
import { TableHeadings } from 'components/table/IntegrationTableCol';
import { DetailFieldNames } from 'model/Integration';
import { DEFINE_METADATA_LABEL } from 'components/inputs/metadata/RegisterMetaData';
import { NOTIFICATION_CONFIG_HEADER } from 'components/inputs/NotificationConfig';
import {
  DBS_LABEL,
  TABLES_LABEL,
} from 'components/inputs/rawSelector/RawSelector';
import { useRawDBAndTables } from 'hooks/useRawDBAndTables';
import { databaseListMock } from 'utils/mockResponse';

jest.mock('hooks/useRawDBAndTables', () => {
  return {
    useRawDBAndTables: jest.fn(),
  };
});
describe('CreateIntegration', () => {
  window.location.href =
    'https://dev.fusion.cogniteapp.com/itera-int-green/integrations/create/name?env=greenfield';
  const props = {
    client: new QueryClient(),
    project: PROJECT_ITERA_INT_GREEN,
    cdfEnv: CDF_ENV_GREENFIELD,
    origin: ORIGIN_DEV,
    route: `${NAME_PATH}`,
    initRegisterIntegration: {},
  };

  test('Renders stored value', () => {
    const name = 'Preset name';
    const withName = { ...props, initRegisterIntegration: { name } };
    renderRegisterContext(<CreateIntegration />, { ...withName });
    const nameInput = screen.getByLabelText(
      INTEGRATION_NAME_HEADING
    ) as HTMLInputElement;
    expect(nameInput).toBeInTheDocument();
    const externalIdInput = screen.getByLabelText(
      INTEGRATION_EXTERNAL_ID_HEADING
    ) as HTMLInputElement;
    expect(externalIdInput).toBeInTheDocument();
    const descriptionInput = screen.getByLabelText(DESCRIPTION_LABEL);
    expect(descriptionInput).toBeInTheDocument();
  });

  test('Interact with form', async () => {
    useRawDBAndTables.mockReturnValue({
      isLoading: false,
      data: databaseListMock,
    });
    renderRegisterContext(<CreateIntegration />, { ...props });
    expect(screen.getByLabelText(INTEGRATION_NAME_HEADING)).toBeInTheDocument();
    const nameInput = screen.getByLabelText(INTEGRATION_NAME_HEADING);
    const saveBtn = screen.getByText(SAVE);
    fireEvent.click(saveBtn);
    await waitFor(() => {
      expect(screen.getByText(NAME_REQUIRED)).toBeInTheDocument();
    });
    expect(screen.getByText(EXTERNAL_ID_REQUIRED)).toBeInTheDocument();

    const integrationName = 'My integration';
    fireEvent.change(nameInput, { target: { value: integrationName } });
    expect(screen.getByDisplayValue(integrationName)).toBeInTheDocument();

    const externalId = 'external_id_1';
    fireEvent.change(screen.getByLabelText(INTEGRATION_EXTERNAL_ID_HEADING), {
      target: { value: externalId },
    });
    expect(screen.getByDisplayValue(externalId)).toBeInTheDocument();

    expect(screen.getAllByText(ADD_MORE_INFO_HEADING).length).toEqual(2);
    fireEvent.click(screen.getByRole('tab'));
    await waitFor(() => {
      expect(screen.getByRole('tabpanel').classList).toContain(
        'rc-collapse-content-active'
      );
    });
    expect(screen.getByLabelText(TableHeadings.SCHEDULE)).toBeVisible();
    expect(screen.getByLabelText(DetailFieldNames.SOURCE)).toBeVisible();
    expect(screen.getByText(DEFINE_METADATA_LABEL)).toBeVisible();
    expect(screen.getByText(NOTIFICATION_CONFIG_HEADER)).toBeVisible();
    expect(screen.getByText(TableHeadings.CONTACTS)).toBeVisible();
    expect(screen.getByText(DetailFieldNames.RAW_TABLE)).toBeVisible();
    expect(
      screen.getByLabelText(DetailFieldNames.DOCUMENTATION)
    ).toBeInTheDocument();
    await waitFor(() => {
      screen.getByLabelText(DBS_LABEL);
    });
    expect(screen.getByLabelText(DBS_LABEL)).toBeInTheDocument();
    expect(screen.getByLabelText(TABLES_LABEL)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab'));
    await waitFor(() => {
      expect(screen.getByRole('tabpanel').classList).toContain(
        'rc-collapse-content-inactive'
      );
    });
  });
});
