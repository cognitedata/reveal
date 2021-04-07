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
import CreateIntegration from 'pages/create/CreateIntegration';
import {
  EXTERNAL_ID_REQUIRED,
  INTEGRATION_EXTERNAL_ID_HEADING,
} from 'pages/create/ExternalIdPage';
import { DESCRIPTION_LABEL } from 'pages/create/DocumentationPage';
import { NAME_REQUIRED } from 'utils/validation/integrationSchemas';

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
  });
});
