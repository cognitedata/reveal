import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { QueryClient } from 'react-query';
import { renderRegisterContext } from '../../utils/test/render';
import { NEXT } from '../../utils/constants';
import {
  CDF_ENV_GREENFIELD,
  ORIGIN_DEV,
  PROJECT_ITERA_INT_GREEN,
} from '../../utils/baseURL';
import ExternalIdPage, {
  EXTERNAL_ID_REQUIRED,
  INTEGRATION_EXTERNAL_ID_HEADING,
} from './ExternalIdPage';

describe('ExternalIdPage', () => {
  const props = {
    client: new QueryClient(),
    project: PROJECT_ITERA_INT_GREEN,
    cdfEnv: CDF_ENV_GREENFIELD,
    origin: ORIGIN_DEV,
    route: `create/integration-external-id`,
    initRegisterIntegration: {},
  };
  test('Renders', () => {
    renderRegisterContext(<ExternalIdPage />, { ...props });
    expect(
      screen.getByText(INTEGRATION_EXTERNAL_ID_HEADING)
    ).toBeInTheDocument();
    expect(screen.getByLabelText('External id')).toBeInTheDocument();
  });

  test('Renders stored value', () => {
    const externalId = 'external_id_1';
    const withExternalId = {
      ...props,
      initRegisterIntegration: { externalId },
    };
    renderRegisterContext(<ExternalIdPage />, { ...withExternalId });
    const externalIdInput = screen.getByLabelText(
      /external id/i
    ) as HTMLInputElement;
    expect(externalIdInput).toBeInTheDocument();
    expect(externalIdInput.value).toEqual(externalId);
  });

  test('Interact with form', async () => {
    renderRegisterContext(<ExternalIdPage />, { ...props });
    const nameInput = screen.getByLabelText('External id');
    const nextBtn = screen.getByText(NEXT);
    fireEvent.click(nextBtn);
    await waitFor(() => {
      expect(screen.getByText(EXTERNAL_ID_REQUIRED)).toBeInTheDocument();
    });
    const externalId = 'some_external_id';
    fireEvent.change(nameInput, { target: { value: externalId } });
    fireEvent.click(nextBtn);
    await waitFor(() => {
      expect(screen.queryByText(EXTERNAL_ID_REQUIRED)).not.toBeInTheDocument();
    });
  });
});
