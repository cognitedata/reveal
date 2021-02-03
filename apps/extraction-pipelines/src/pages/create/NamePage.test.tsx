import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { QueryClient } from 'react-query';
import render, {
  renderWithReQueryCacheSelectedIntegrationContext,
} from '../../utils/test/render';
import NamePage, { INTEGRATION_NAME_HEADING, NAME_REQUIRED } from './NamePage';
import { NEXT } from '../../utils/constants';
import { ORIGIN_DEV, PROJECT_ITERA_INT_GREEN } from '../../utils/baseURL';

describe('NamePage', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = renderWithReQueryCacheSelectedIntegrationContext(
      new QueryClient(),
      PROJECT_ITERA_INT_GREEN,
      PROJECT_ITERA_INT_GREEN,
      ORIGIN_DEV,
      undefined,
      `create/integration-name`
    );
    render(<NamePage />, { wrapper });
  });
  test('Renders', () => {
    expect(screen.getByText(INTEGRATION_NAME_HEADING)).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
  });

  test('Interact with form', async () => {
    const nameInput = screen.getByLabelText('Name');
    const nextBtn = screen.getByText(NEXT);
    fireEvent.click(nextBtn);
    await waitFor(() => {
      expect(screen.getByText(NAME_REQUIRED)).toBeInTheDocument();
    });
    const integrationName = 'My integration';
    fireEvent.change(nameInput, { target: { value: integrationName } });
    fireEvent.click(nextBtn);
    await waitFor(() => {
      expect(screen.queryByText(NAME_REQUIRED)).not.toBeInTheDocument();
    });
  });
});
