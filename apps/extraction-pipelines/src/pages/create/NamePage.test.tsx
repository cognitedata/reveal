import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom/extend-expect';
import { QueryClient } from 'react-query';
import { renderRegisterContext } from '../../utils/test/render';
import NamePage, { INTEGRATION_NAME_HEADING, NAME_REQUIRED } from './NamePage';
import { NEXT } from '../../utils/constants';
import {
  CDF_ENV_GREENFIELD,
  ORIGIN_DEV,
  PROJECT_ITERA_INT_GREEN,
} from '../../utils/baseURL';
import { NAME_PATH } from '../../routing/CreateRouteConfig';
import '../../utils/test/windowLocation';

describe('NamePage', () => {
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
    renderRegisterContext(<NamePage />, { ...withName });
    const nameInput = screen.getByLabelText(
      INTEGRATION_NAME_HEADING
    ) as HTMLInputElement;
    expect(nameInput).toBeInTheDocument();
    expect(nameInput.value).toEqual(name);
  });

  test('Interact with form', async () => {
    renderRegisterContext(<NamePage />, { ...props });
    expect(screen.getByLabelText(INTEGRATION_NAME_HEADING)).toBeInTheDocument();
    const nameInput = screen.getByLabelText(INTEGRATION_NAME_HEADING);
    const nextBtn = screen.getByText(NEXT);
    fireEvent.click(nextBtn);
    await waitFor(() => {
      expect(screen.getByText(NAME_REQUIRED)).toBeInTheDocument();
    });
    const integrationName = 'My integration';
    fireEvent.change(nameInput, { target: { value: integrationName } });
    expect(screen.getByDisplayValue(integrationName)).toBeInTheDocument();
  });
});
