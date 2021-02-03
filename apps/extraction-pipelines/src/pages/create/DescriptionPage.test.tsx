import React from 'react';
import { fireEvent, screen, waitFor } from '@testing-library/react';
import { QueryClient } from 'react-query';
import render, {
  renderWithReQueryCacheSelectedIntegrationContext,
} from '../../utils/test/render';
import { ORIGIN_DEV, PROJECT_ITERA_INT_GREEN } from '../../utils/baseURL';
import DescriptionPage, {
  INTEGRATION_DESCRIPTION_HEADING,
} from './DescriptionPage';

describe('DescriptionPage', () => {
  let wrapper;
  beforeEach(() => {
    wrapper = renderWithReQueryCacheSelectedIntegrationContext(
      new QueryClient(),
      PROJECT_ITERA_INT_GREEN,
      PROJECT_ITERA_INT_GREEN,
      ORIGIN_DEV,
      undefined,
      `create/integration-description`
    );
    render(<DescriptionPage />, { wrapper });
  });
  test('Renders', () => {
    expect(
      screen.getByText(INTEGRATION_DESCRIPTION_HEADING)
    ).toBeInTheDocument();
    expect(screen.getByLabelText('Description')).toBeInTheDocument();
  });

  test('Interact with form', async () => {
    const nameInput = screen.getByLabelText('Description');
    const description = 'Im entering a description for the integration';
    fireEvent.change(nameInput, { target: { value: description } });
    await waitFor(() => {
      expect(screen.getByDisplayValue(description)).toBeInTheDocument();
    });
  });
});
